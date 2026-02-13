"""Alerts Endpoints"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from app.schemas.alert import AlertResponse, AlertResolve
from app.services.alert_service import AlertService
from app.services.auth_service import AuthService
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/alerts", tags=["Alerts"])


async def get_current_user_from_header(authorization: str = None):
    """Extract user from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
        user = await AuthService.get_current_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization header")


@router.get("", response_model=List[AlertResponse])
async def get_alerts(
    authorization: str = None,
    resolved: Optional[bool] = None,
    limit: int = 100
):
    """Get user's alerts"""
    user = await get_current_user_from_header(authorization)
    
    alerts = await AlertService.get_alerts(
        user_id=user["id"],
        resolved=resolved,
        limit=limit
    )
    
    return [AlertResponse(**alert) for alert in alerts]


@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: str, authorization: str = None):
    """Resolve an alert"""
    user = await get_current_user_from_header(authorization)
    
    try:
        result = await AlertService.resolve_alert(alert_id, user["id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{service_id}/service")
async def get_service_alerts(service_id: str, authorization: str = None):
    """Get active alerts for a service"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    # Verify user owns this service
    service = await db.services.find_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])}
    )
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    alerts = list(
        await db.alerts.find(
            {"service_id": ObjectId(service_id), "resolved": False}
        )
        .sort("created_at", -1)
        .to_list(100)
    )
    
    return [
        {
            "id": str(a["_id"]),
            "service_id": str(a["service_id"]),
            "service_name": service["name"],
            "alert_type": a["alert_type"],
            "message": a["message"],
            "severity": a["severity"],
            "created_at": a["created_at"].isoformat(),
        }
        for a in alerts
    ]
