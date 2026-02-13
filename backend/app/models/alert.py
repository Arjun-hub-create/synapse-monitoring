"""Alert Model"""
from datetime import datetime
from typing import Optional
from bson import ObjectId


class Alert:
    """Alert model for service failures"""

    def __init__(
        self,
        service_id: ObjectId,
        user_id: ObjectId,
        alert_type: str,  # "service_down", "high_latency", "repeated_failures"
        message: str,
        severity: str = "warning",  # "info", "warning", "critical"
        resolved: bool = False,
        _id: Optional[ObjectId] = None,
        created_at: Optional[datetime] = None,
        resolved_at: Optional[datetime] = None,
    ):
        self._id = _id or ObjectId()
        self.service_id = service_id
        self.user_id = user_id
        self.alert_type = alert_type
        self.message = message
        self.severity = severity
        self.resolved = resolved
        self.created_at = created_at or datetime.utcnow()
        self.resolved_at = resolved_at

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "service_id": self.service_id,
            "user_id": self.user_id,
            "alert_type": self.alert_type,
            "message": self.message,
            "severity": self.severity,
            "resolved": self.resolved,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at,
        }
