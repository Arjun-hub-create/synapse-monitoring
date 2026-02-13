"""Health Check Endpoints"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.health import HealthCheckResponse, ServiceMetricsResponse
from app.services.health_service import HealthCheckService
from app.services.auth_service import AuthService
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/health", tags=["Health"])


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


@router.post("/{service_id}/check")
async def trigger_health_check(service_id: str, authorization: str = None):
    """Manually trigger health check for a service"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    service = await db.services.find_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])}
    )
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Perform check
    check_data = await HealthCheckService.perform_health_check(
        service_id, service["health_check_url"]
    )
    
    # Record check
    result = await HealthCheckService.record_health_check(service_id, check_data)
    
    return HealthCheckResponse(
        id=result["id"],
        service_id=service_id,
        status=result["status"],
        response_time_ms=result["response_time_ms"],
        status_code=result["status_code"],
        error_message=result.get("error_message"),
        timestamp=__import__("datetime").datetime.utcnow(),
    )


@router.get("/{service_id}/history", response_model=List[HealthCheckResponse])
async def get_health_history(service_id: str, authorization: str = None, limit: int = 100):
    """Get health check history"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    service = await db.services.find_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])}
    )
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    history = await HealthCheckService.get_health_check_history(service_id, limit)
    
    return [
        HealthCheckResponse(
            id=h["id"],
            service_id=h["service_id"],
            status=h["status"],
            response_time_ms=h["response_time_ms"],
            status_code=h["status_code"],
            error_message=h.get("error_message"),
            timestamp=__import__("datetime").datetime.fromisoformat(h["timestamp"]),
        )
        for h in history
    ]


@router.get("/{service_id}/metrics", response_model=ServiceMetricsResponse)
async def get_metrics(service_id: str, authorization: str = None):
    """Get service metrics"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    service = await db.services.find_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])}
    )
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    metrics = await HealthCheckService.get_service_metrics(service_id)
    
    return ServiceMetricsResponse(**metrics)


@router.get("/all/metrics")
async def get_all_metrics(authorization: str = None):
    """Get metrics for all user's services"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    services = list(
        await db.services.find({"user_id": ObjectId(user["id"]), "is_active": True})
        .to_list(1000)
    )
    
    all_metrics = []
    for service in services:
        metrics = await HealthCheckService.get_service_metrics(str(service["_id"]))
        all_metrics.append(metrics)
    
    return all_metrics
