"""Health Check Schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class HealthCheckResponse(BaseModel):
    """Health check response schema"""

    id: Optional[str] = None
    service_id: str
    status: str  # "healthy", "unhealthy", "degraded"
    response_time_ms: float
    status_code: int
    error_message: Optional[str] = None
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "service_id": "507f1f77bcf86cd799439012",
                "status": "healthy",
                "response_time_ms": 45.23,
                "status_code": 200,
                "error_message": None,
                "timestamp": "2024-01-15T12:30:45",
            }
        }


class ServiceMetricsResponse(BaseModel):
    """Service metrics response"""

    service_id: str
    service_name: str
    current_status: str
    uptime_percentage: float
    avg_response_time_ms: float
    min_response_time_ms: float
    max_response_time_ms: float
    total_checks: int
    failed_checks: int
    last_check_at: Optional[datetime] = None
    checks_24h: list = []

    class Config:
        json_schema_extra = {
            "example": {
                "service_id": "507f1f77bcf86cd799439012",
                "service_name": "Auth Service",
                "current_status": "healthy",
                "uptime_percentage": 99.5,
                "avg_response_time_ms": 45.23,
                "min_response_time_ms": 12.5,
                "max_response_time_ms": 120.3,
                "total_checks": 1440,
                "failed_checks": 7,
                "last_check_at": "2024-01-15T12:30:45",
            }
        }
