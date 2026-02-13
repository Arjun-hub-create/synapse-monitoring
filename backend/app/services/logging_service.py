"""Logging Service"""
from datetime import datetime
from app.database import get_db
from bson import ObjectId


class LoggingService:
    """Centralized logging service"""

    @staticmethod
    async def log_event(
        event_type: str,
        service_id: Optional[str] = None,
        user_id: Optional[str] = None,
        details: Optional[dict] = None,
        level: str = "info",
    ) -> None:
        """Log an event"""
        db = get_db()
        
        log_entry = {
            "type": event_type,
            "service_id": ObjectId(service_id) if service_id else None,
            "user_id": ObjectId(user_id) if user_id else None,
            "level": level,  # "info", "warning", "error", "critical"
            "details": details or {},
            "timestamp": datetime.utcnow(),
        }
        
        await db.logs.insert_one(log_entry)

    @staticmethod
    async def get_logs(
        service_id: Optional[str] = None,
        limit: int = 100,
        level: Optional[str] = None,
    ) -> list:
        """Get logs"""
        db = get_db()
        
        query = {}
        if service_id:
            query["service_id"] = ObjectId(service_id)
        if level:
            query["level"] = level
        
        logs = list(
            await db.logs.find(query)
            .sort("timestamp", -1)
            .limit(limit)
            .to_list(limit)
        )
        
        return [
            {
                "id": str(log["_id"]),
                "type": log["type"],
                "service_id": str(log["service_id"]) if log.get("service_id") else None,
                "user_id": str(log["user_id"]) if log.get("user_id") else None,
                "level": log["level"],
                "details": log.get("details", {}),
                "timestamp": log["timestamp"].isoformat(),
            }
            for log in logs
        ]

    @staticmethod
    async def get_system_logs(limit: int = 100) -> list:
        """Get system-level logs"""
        return await LoggingService.get_logs(limit=limit)


from typing import Optional
