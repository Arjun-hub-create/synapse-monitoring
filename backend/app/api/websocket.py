"""WebSocket Endpoint for Live Metrics"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
import json
import asyncio
from datetime import datetime, timedelta
from app.services.auth_service import AuthService
from app.services.health_service import HealthCheckService
from app.database import get_db
from bson import ObjectId

router = APIRouter(tags=["WebSocket"])

# Track connected clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    async def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def send_personal(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass


manager = ConnectionManager()


@router.websocket("/ws/metrics/{token}")
async def websocket_metrics(websocket: WebSocket, token: str):
    """WebSocket endpoint for live metrics streaming"""
    
    # Authenticate user
    payload = AuthService.verify_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Unauthorized")
        return
    
    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return
    
    await manager.connect(websocket, user_id)
    db = get_db()
    
    try:
        # Send connected message
        await manager.send_personal(
            websocket,
            {
                "type": "connection",
                "message": "Connected to metrics stream",
                "timestamp": datetime.utcnow().isoformat(),
            },
        )
        
        # Continuous metrics update loop
        while True:
            # Get user's services
            services = list(
                await db.services.find(
                    {"user_id": ObjectId(user_id), "is_active": True}
                )
                .to_list(1000)
            )
            
            for service in services:
                # Get latest health check
                latest_check = await db.health_checks.find_one(
                    {"service_id": service["_id"]},
                    sort=[("timestamp", -1)],
                )
                
                if latest_check:
                    await manager.send_personal(
                        websocket,
                        {
                            "type": "health_update",
                            "service_id": str(service["_id"]),
                            "service_name": service["name"],
                            "status": latest_check["status"],
                            "response_time_ms": latest_check["response_time_ms"],
                            "status_code": latest_check["status_code"],
                            "timestamp": latest_check["timestamp"].isoformat(),
                        },
                    )
            
            # Get recent alerts
            recent_alerts = list(
                await db.alerts.find(
                    {
                        "user_id": ObjectId(user_id),
                        "resolved": False,
                        "created_at": {
                            "$gte": datetime.utcnow() - timedelta(minutes=5)
                        },
                    }
                )
                .to_list(10)
            )
            
            if recent_alerts:
                for alert in recent_alerts:
                    service = await db.services.find_one({"_id": alert["service_id"]})
                    await manager.send_personal(
                        websocket,
                        {
                            "type": "alert",
                            "alert_id": str(alert["_id"]),
                            "service_id": str(alert["service_id"]),
                            "service_name": service["name"] if service else "Unknown",
                            "alert_type": alert["alert_type"],
                            "message": alert["message"],
                            "severity": alert["severity"],
                            "created_at": alert["created_at"].isoformat(),
                        },
                    )
            
            # Wait before next update
            await asyncio.sleep(5)  # Update every 5 seconds
            
    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket)
    except Exception as e:
        await manager.disconnect(user_id, websocket)
        print(f"WebSocket error: {e}")
