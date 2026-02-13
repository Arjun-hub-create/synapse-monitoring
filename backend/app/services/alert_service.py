"""Alert Service"""
from datetime import datetime, timedelta
from typing import List, Optional
from app.database import get_db
from app.models.alert import Alert
from bson import ObjectId


class AlertService:
    """Service for managing alerts"""

    @staticmethod
    async def create_alert(
        service_id: str,
        user_id: str,
        alert_type: str,
        message: str,
        severity: str = "warning",
    ) -> dict:
        """Create a new alert"""
        db = get_db()
        
        # Check for recent duplicate alerts
        recent_alert = await db.alerts.find_one(
            {
                "service_id": ObjectId(service_id),
                "alert_type": alert_type,
                "resolved": False,
                "created_at": {"$gte": datetime.utcnow() - timedelta(minutes=5)},
            }
        )
        
        if recent_alert:
            return {"id": str(recent_alert["_id"]), "message": "Alert already exists"}
        
        alert = Alert(
            service_id=ObjectId(service_id),
            user_id=ObjectId(user_id),
            alert_type=alert_type,
            message=message,
            severity=severity,
        )
        
        result = await db.alerts.insert_one(alert.to_dict())
        
        # Log the alert
        await AlertService._log_alert(
            str(result.inserted_id), service_id, alert_type, message
        )
        
        return {"id": str(result.inserted_id), "message": "Alert created"}

    @staticmethod
    async def get_alerts(
        user_id: str, resolved: Optional[bool] = None, limit: int = 100
    ) -> List[dict]:
        """Get user's alerts"""
        db = get_db()
        
        query = {"user_id": ObjectId(user_id)}
        if resolved is not None:
            query["resolved"] = resolved
        
        alerts = list(
            await db.alerts.find(query)
            .sort("created_at", -1)
            .limit(limit)
            .to_list(limit)
        )
        
        # Enrich with service names
        results = []
        for alert in alerts:
            service = await db.services.find_one({"_id": alert["service_id"]})
            results.append(
                {
                    "id": str(alert["_id"]),
                    "service_id": str(alert["service_id"]),
                    "service_name": service["name"] if service else "Unknown",
                    "alert_type": alert["alert_type"],
                    "message": alert["message"],
                    "severity": alert["severity"],
                    "resolved": alert["resolved"],
                    "created_at": alert["created_at"].isoformat(),
                    "resolved_at": alert.get("resolved_at").isoformat()
                    if alert.get("resolved_at")
                    else None,
                }
            )
        
        return results

    @staticmethod
    async def resolve_alert(alert_id: str, user_id: str) -> dict:
        """Resolve an alert"""
        db = get_db()
        
        result = await db.alerts.update_one(
            {"_id": ObjectId(alert_id), "user_id": ObjectId(user_id)},
            {
                "$set": {
                    "resolved": True,
                    "resolved_at": datetime.utcnow(),
                }
            },
        )
        
        if result.matched_count == 0:
            raise ValueError("Alert not found or unauthorized")
        
        return {"message": "Alert resolved"}

    @staticmethod
    async def resolve_service_alerts(service_id: str) -> dict:
        """Resolve all alerts for a service"""
        db = get_db()
        
        result = await db.alerts.update_many(
            {"service_id": ObjectId(service_id), "resolved": False},
            {
                "$set": {
                    "resolved": True,
                    "resolved_at": datetime.utcnow(),
                }
            },
        )
        
        return {"resolved_count": result.modified_count}

    @staticmethod
    async def _log_alert(
        alert_id: str, service_id: str, alert_type: str, message: str
    ) -> None:
        """Log alert event"""
        db = get_db()
        
        await db.logs.insert_one(
            {
                "type": "alert",
                "alert_id": alert_id,
                "service_id": ObjectId(service_id),
                "alert_type": alert_type,
                "message": message,
                "timestamp": datetime.utcnow(),
            }
        )

    @staticmethod
    async def check_for_service_failures(
        service_id: str, user_id: str, failure_threshold: int = 3
    ) -> None:
        """Check if service has repeated failures and create alert"""
        db = get_db()
        
        # Get recent failed checks
        since = datetime.utcnow() - timedelta(minutes=10)
        failed_checks = list(
            await db.health_checks.find(
                {
                    "service_id": ObjectId(service_id),
                    "status": {"$ne": "healthy"},
                    "timestamp": {"$gte": since},
                }
            )
            .sort("timestamp", -1)
            .limit(failure_threshold)
            .to_list(failure_threshold)
        )
        
        if len(failed_checks) >= failure_threshold:
            # Get service name
            service = await db.services.find_one({"_id": ObjectId(service_id)})
            service_name = service["name"] if service else "Unknown"
            
            await AlertService.create_alert(
                service_id=service_id,
                user_id=user_id,
                alert_type="repeated_failures",
                message=f"Service '{service_name}' has failed {failure_threshold} consecutive health checks",
                severity="critical",
            )
