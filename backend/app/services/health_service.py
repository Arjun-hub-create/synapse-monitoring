"""Health Check Service"""
import httpx
from datetime import datetime, timedelta
from typing import Optional, List
from app.database import get_db
from app.models.health_check import HealthCheck
from bson import ObjectId
import asyncio


class HealthCheckService:
    """Service for managing health checks"""

    @staticmethod
    async def perform_health_check(service_id: str, url: str) -> dict:
        """Perform a health check on a service"""
        try:
            start_time = datetime.utcnow()
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
            
            response_time_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Determine status
            if 200 <= response.status_code < 300:
                status = "healthy"
            elif 500 <= response.status_code < 600:
                status = "unhealthy"
            else:
                status = "degraded"
            
            return {
                "status": status,
                "response_time_ms": response_time_ms,
                "status_code": response.status_code,
                "error_message": None,
            }
        except asyncio.TimeoutError:
            return {
                "status": "unhealthy",
                "response_time_ms": 10000.0,
                "status_code": 0,
                "error_message": "Request timeout",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_time_ms": 0,
                "status_code": 0,
                "error_message": str(e),
            }

    @staticmethod
    async def record_health_check(service_id: str, check_data: dict) -> dict:
        """Record health check result to database"""
        db = get_db()
        
        health_check = HealthCheck(
            service_id=ObjectId(service_id),
            status=check_data["status"],
            response_time_ms=check_data["response_time_ms"],
            status_code=check_data["status_code"],
            error_message=check_data.get("error_message"),
        )
        
        result = await db.health_checks.insert_one(health_check.to_dict())
        return {"id": str(result.inserted_id), **check_data}

    @staticmethod
    async def get_service_metrics(service_id: str, hours: int = 24) -> dict:
        """Get service metrics for the last N hours"""
        db = get_db()
        
        # Get service info
        service = await db.services.find_one({"_id": ObjectId(service_id)})
        if not service:
            raise ValueError("Service not found")
        
        # Get health checks
        since = datetime.utcnow() - timedelta(hours=hours)
        checks = list(
            await db.health_checks.find(
                {"service_id": ObjectId(service_id), "timestamp": {"$gte": since}}
            )
            .sort("timestamp", -1)
            .to_list(10000)
        )
        
        if not checks:
            return {
                "service_id": service_id,
                "service_name": service["name"],
                "current_status": "unknown",
                "uptime_percentage": 0,
                "avg_response_time_ms": 0,
                "min_response_time_ms": 0,
                "max_response_time_ms": 0,
                "total_checks": 0,
                "failed_checks": 0,
                "last_check_at": None,
                "checks_24h": [],
            }
        
        # Calculate metrics
        response_times = [c["response_time_ms"] for c in checks]
        healthy_checks = len([c for c in checks if c["status"] == "healthy"])
        failed_checks = len(checks) - healthy_checks
        
        return {
            "service_id": service_id,
            "service_name": service["name"],
            "current_status": checks[0]["status"],
            "uptime_percentage": (healthy_checks / len(checks)) * 100 if checks else 0,
            "avg_response_time_ms": sum(response_times) / len(response_times) if response_times else 0,
            "min_response_time_ms": min(response_times) if response_times else 0,
            "max_response_time_ms": max(response_times) if response_times else 0,
            "total_checks": len(checks),
            "failed_checks": failed_checks,
            "last_check_at": checks[0]["timestamp"],
            "checks_24h": [
                {
                    "timestamp": c["timestamp"].isoformat(),
                    "status": c["status"],
                    "response_time_ms": c["response_time_ms"],
                }
                for c in checks[:100]  # Last 100 checks
            ],
        }

    @staticmethod
    async def get_health_check_history(
        service_id: str, limit: int = 100, hours: int = 24
    ) -> List[dict]:
        """Get health check history"""
        db = get_db()
        since = datetime.utcnow() - timedelta(hours=hours)
        
        checks = list(
            await db.health_checks.find(
                {"service_id": ObjectId(service_id), "timestamp": {"$gte": since}}
            )
            .sort("timestamp", -1)
            .limit(limit)
            .to_list(limit)
        )
        
        return [
            {
                "id": str(c["_id"]),
                "service_id": str(c["service_id"]),
                "status": c["status"],
                "response_time_ms": c["response_time_ms"],
                "status_code": c["status_code"],
                "error_message": c.get("error_message"),
                "timestamp": c["timestamp"].isoformat(),
            }
            for c in checks
        ]
