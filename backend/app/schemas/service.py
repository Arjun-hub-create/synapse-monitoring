"""Service Schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ServiceCreate(BaseModel):
    """Service creation schema"""

    name: str
    # Allow any URL-like string in local/demo instead of strict HttpUrl
    health_check_url: str
    description: Optional[str] = ""
    headers: Optional[dict] = None
    tags: Optional[List[str]] = None
    email_alerts_enabled: Optional[bool] = False

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Auth Service",
                "health_check_url": "http://auth-service.local:8000/health",
                "description": "Authentication microservice",
            }
        }


class ServiceUpdate(BaseModel):
    """Service update schema"""

    name: Optional[str] = None
    health_check_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    headers: Optional[dict] = None
    tags: Optional[List[str]] = None
    email_alerts_enabled: Optional[bool] = None


class ServiceResponse(BaseModel):
    """Service response schema"""

    id: Optional[str] = None
    name: str
    health_check_url: str
    description: str
    is_active: bool
    headers: Optional[dict] = None
    tags: Optional[List[str]] = None
    email_alerts_enabled: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": "Auth Service",
                "health_check_url": "http://auth-service.local:8000/health",
                "description": "Authentication microservice",
                "is_active": True,
                "created_at": "2024-01-15T12:30:45",
                "updated_at": "2024-01-15T12:30:45",
            }
        }


class ServiceDetailResponse(ServiceResponse):
    """Service detail response with metrics"""

    current_status: str  # "healthy", "unhealthy", "degraded"
    last_check_at: Optional[datetime] = None
    uptime_percentage: float = 100.0
    avg_response_time_ms: float = 0.0
