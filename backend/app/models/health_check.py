"""Health Check Model"""
from datetime import datetime
from typing import Optional
from bson import ObjectId


class HealthCheck:
    """Health check record model"""

    def __init__(
        self,
        service_id: ObjectId,
        status: str,  # "healthy", "unhealthy", "degraded"
        response_time_ms: float,
        status_code: int,
        error_message: Optional[str] = None,
        _id: Optional[ObjectId] = None,
        timestamp: Optional[datetime] = None,
    ):
        self._id = _id or ObjectId()
        self.service_id = service_id
        self.status = status
        self.response_time_ms = response_time_ms
        self.status_code = status_code
        self.error_message = error_message
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "service_id": self.service_id,
            "status": self.status,
            "response_time_ms": self.response_time_ms,
            "status_code": self.status_code,
            "error_message": self.error_message,
            "timestamp": self.timestamp,
        }
