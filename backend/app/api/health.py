"""Health Check Endpoints"""
from fastapi import APIRouter, HTTPException, Header
from typing import List
from app.schemas.health import HealthCheckResponse, ServiceMetricsResponse
from app.services.health_service import HealthCheckService
from app.services.auth_service import AuthService
from app.database import get_db
from bson import ObjectId
import datetime

router = APIRouter(prefix="/health", tags=["Health"])


async def get_current_user_from_header(authorization: str = None):
    """Extract user from Authorization header. Falls back to demo user."""
    if not authorization:
        return {"id": "demo_user_1", "email": "demo@example.com"}
    try:
        parts = authorization.split(" ")
        if len(parts) != 2:
            return {"id": "demo_user_1", "email": "demo@example.com"}
        token = parts[1]
        user = await AuthService.get_current_user(token)
        if not user:
            return {"id": "demo_user_1", "email": "demo@example.com"}
        return user
    except Exception:
        return {"id": "demo_user_1", "email": "demo@example.com"}


def is_valid_object_id(id_str: str) -> bool:
    """Check if string is a valid MongoDB ObjectId."""
    try:
        ObjectId(id_str)
        return True
    except Exception:
        return False


@router.get("/all/metrics")
async def get_all_metrics(authorization: str = Header(None)):
    """Get metrics for all user's services"""
    user = await get_current_user_from_header(authorization)
    db = get_db()

    try:
        # ── FIX: removed wrong list() wrapper around await ──────────
        if is_valid_object_id(user["id"]):
            query = {"user_id": ObjectId(user["id"]), "is_active": True}
        else:
            # demo user — return empty list, nothing saved for demo users
            return []

        services = await db.services.find(query).to_list(1000)

        all_metrics = []
        for service in services:
            try:
                metrics = await HealthCheckService.get_service_metrics(str(service["_id"]))
                all_metrics.append(metrics)
            except Exception:
                continue

        return all_metrics

    except Exception as e:
        # Log and return empty list instead of crashing
        import logging
        logging.getLogger(__name__).error(f"get_all_metrics error: {e}")
        return []


@router.post("/{service_id}/check")
async def trigger_health_check(service_id: str, authorization: str = Header(None)):
    """Manually trigger health check for a service"""
    user = await get_current_user_from_header(authorization)
    db = get_db()

    if not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    query = {"_id": ObjectId(service_id)}
    if is_valid_object_id(user["id"]):
        query["user_id"] = ObjectId(user["id"])

    service = await db.services.find_one(query)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    check_data = await HealthCheckService.perform_health_check(
        service_id, service["health_check_url"], service.get("headers")
    )
    result = await HealthCheckService.record_health_check(service_id, check_data)

    return HealthCheckResponse(
        id=result["id"],
        service_id=service_id,
        status=result["status"],
        response_time_ms=result["response_time_ms"],
        status_code=result["status_code"],
        error_message=result.get("error_message"),
        timestamp=datetime.datetime.utcnow(),
    )


@router.get("/{service_id}/history", response_model=List[HealthCheckResponse])
async def get_health_history(service_id: str, authorization: str = Header(None), limit: int = 100):
    """Get health check history"""
    user = await get_current_user_from_header(authorization)
    db = get_db()

    if not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    query = {"_id": ObjectId(service_id)}
    if is_valid_object_id(user["id"]):
        query["user_id"] = ObjectId(user["id"])

    service = await db.services.find_one(query)
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
            timestamp=datetime.datetime.fromisoformat(h["timestamp"]),
        )
        for h in history
    ]


@router.get("/{service_id}/metrics", response_model=ServiceMetricsResponse)
async def get_metrics(service_id: str, authorization: str = Header(None)):
    """Get service metrics"""
    user = await get_current_user_from_header(authorization)
    db = get_db()

    if not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    query = {"_id": ObjectId(service_id)}
    if is_valid_object_id(user["id"]):
        query["user_id"] = ObjectId(user["id"])

    service = await db.services.find_one(query)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    metrics = await HealthCheckService.get_service_metrics(service_id)
    return ServiceMetricsResponse(**metrics)


