"""Alert Schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertResponse(BaseModel):
    """Alert response schema"""

    id: Optional[str] = None
    service_id: str
    service_name: Optional[str] = None
    alert_type: str  # "service_down", "high_latency", "repeated_failures"
    message: str
    severity: str  # "info", "warning", "critical"
    resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "service_id": "507f1f77bcf86cd799439012",
                "service_name": "Auth Service",
                "alert_type": "service_down",
                "message": "Service has been down for 5 minutes",
                "severity": "critical",
                "resolved": False,
                "created_at": "2024-01-15T12:30:45",
                "resolved_at": None,
            }
        }


class AlertResolve(BaseModel):
    """Alert resolve schema"""

    resolved: bool

    class Config:
        json_schema_extra = {"example": {"resolved": True}}
