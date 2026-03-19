"""Service Management Endpoints"""
from fastapi import APIRouter, HTTPException, status, Header
from fastapi.responses import Response
from typing import List
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse, ServiceDetailResponse
from app.models.service import Service
from app.services.auth_service import AuthService
from app.services.health_service import HealthCheckService
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/services", tags=["Services"])


def is_valid_object_id(id_str: str) -> bool:
    """Check if string is a valid MongoDB ObjectId."""
    try:
        ObjectId(id_str)
        return True
    except Exception:
        return False


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


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate, authorization: str = Header(None)
):
    """Create a new service to monitor"""
    user = await get_current_user_from_header(authorization)

    # ── FIX: don't try ObjectId("demo_user_1") — it crashes ────────
    if not is_valid_object_id(user["id"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in to add a service. Register or login first."
        )

    try:
        from app.database import get_db
        db = get_db()

        service = Service(
            user_id=ObjectId(user["id"]),
            name=service_data.name,
            health_check_url=str(service_data.health_check_url),
            description=service_data.description or "",
            headers=service_data.headers,
            tags=service_data.tags,
            email_alerts_enabled=service_data.email_alerts_enabled,
        )

        result = await db.services.insert_one(service.to_dict())

        return ServiceResponse(
            id=str(result.inserted_id),
            name=service.name,
            health_check_url=service.health_check_url,
            description=service.description,
            is_active=service.is_active,
            headers=service.headers,
            tags=service.tags,
            email_alerts_enabled=service.email_alerts_enabled,
            created_at=service.created_at,
            updated_at=service.updated_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"create_service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save service. Check backend logs."
        )


@router.get("", response_model=List[ServiceResponse])
async def list_services(authorization: str = Header(None)):
    """List all services for user"""
    user = await get_current_user_from_header(authorization)

    # ── FIX: demo users have no real services ───────────────────────
    if not is_valid_object_id(user["id"]):
        return []

    try:
        from app.database import get_db
        db = get_db()

        # ── FIX: removed wrong list() wrapper ───────────────────────
        services = await db.services.find(
            {"user_id": ObjectId(user["id"]), "is_active": True}
        ).to_list(1000)

        return [
            ServiceResponse(
                id=str(s["_id"]),
                name=s["name"],
                health_check_url=s["health_check_url"],
                description=s.get("description", ""),
                is_active=s["is_active"],
                headers=s.get("headers"),
                tags=s.get("tags"),
                email_alerts_enabled=s.get("email_alerts_enabled", False),
                created_at=s["created_at"],
                updated_at=s["updated_at"],
            )
            for s in services
        ]

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"list_services error: {e}")
        return []


@router.get("/{service_id}", response_model=ServiceDetailResponse)
async def get_service_details(service_id: str, authorization: str = Header(None)):
    """Get service details with current metrics"""
    user = await get_current_user_from_header(authorization)

    if not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    from app.database import get_db
    db = get_db()

    query = {"_id": ObjectId(service_id)}
    if is_valid_object_id(user["id"]):
        query["user_id"] = ObjectId(user["id"])

    service = await db.services.find_one(query)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    metrics = await HealthCheckService.get_service_metrics(service_id)

    return ServiceDetailResponse(
        id=str(service["_id"]),
        name=service["name"],
        health_check_url=service["health_check_url"],
        description=service.get("description", ""),
        is_active=service["is_active"],
        headers=service.get("headers"),
        tags=service.get("tags"),
        email_alerts_enabled=service.get("email_alerts_enabled", False),
        created_at=service["created_at"],
        updated_at=service["updated_at"],
        current_status=metrics["current_status"],
        last_check_at=metrics.get("last_check_at"),
        uptime_percentage=metrics["uptime_percentage"],
        avg_response_time_ms=metrics["avg_response_time_ms"],
    )


@router.get("/{service_id}/badge")
async def get_service_badge(service_id: str):
    """Public endpoint: Get an SVG status badge for the service"""
    from fastapi.responses import Response
    
    svg_not_found = '''<svg xmlns="http://www.w3.org/2000/svg" width="104" height="20"><g clip-path="url(#a)"><path fill="#555" d="M0 0h55v20H0z"/><path fill="#9f9f9f" d="M55 0h49v20H55z"/><path fill="url(#b)" d="M0 0h104v20H0z"/></g><g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110"><text x="285" y="140" transform="scale(.1)" textLength="450">synapse</text><text x="785" y="140" transform="scale(.1)" textLength="390">not found</text></g></svg>'''

    if not is_valid_object_id(service_id):
        return Response(content=svg_not_found, media_type="image/svg+xml")

    from app.database import get_db
    db = get_db()
    
    service = await db.services.find_one({"_id": ObjectId(service_id), "is_active": True})
    if not service:
        return Response(content=svg_not_found, media_type="image/svg+xml")

    metrics = await HealthCheckService.get_service_metrics(service_id)
    
    status_val = metrics.get("current_status", "unknown")
    uptime = metrics.get("uptime_percentage", 0)
    
    if status_val == "healthy":
        color = "#4c1" # Bright green
        status_text = f"Healthy {uptime:.1f}%"
    elif status_val == "unhealthy":
        color = "#e05d44" # Red
        status_text = f"Down {uptime:.1f}%"
    else:
        color = "#9f9f9f" # Grey
        status_text = "Unknown"
        
    # Approximate width calc (1 character roughly 6px width)
    text_width = len(status_text) * 6 + 10
    total_width = 54 + text_width
    text_x = 540 + (text_width * 10) // 2
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{total_width}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a"><rect width="{total_width}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#a)">
    <path fill="#555" d="M0 0h54v20H0z"/>
    <path fill="{color}" d="M54 0h{text_width}v20H54z"/>
    <path fill="url(#b)" d="M0 0h{total_width}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text x="280" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="440">synapse</text>
    <text x="280" y="140" transform="scale(.1)" textLength="440">synapse</text>
    <text x="{text_x}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="{text_width * 10 - 100}">{status_text}</text>
    <text x="{text_x}" y="140" transform="scale(.1)" textLength="{text_width * 10 - 100}">{status_text}</text>
  </g>
</svg>'''

    return Response(content=svg, media_type="image/svg+xml", headers={"Cache-Control": "no-cache, max-age=0, must-revalidate"})


@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str, service_data: ServiceUpdate, authorization: str = Header(None)
):
    """Update service"""
    user = await get_current_user_from_header(authorization)

    if not is_valid_object_id(user["id"]) or not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    from app.database import get_db
    db = get_db()

    update_data = {}
    if service_data.name:
        update_data["name"] = service_data.name
    if service_data.health_check_url:
        update_data["health_check_url"] = str(service_data.health_check_url)
    if service_data.description is not None:
        update_data["description"] = service_data.description
    if service_data.is_active is not None:
        update_data["is_active"] = service_data.is_active
    if service_data.headers is not None:
        update_data["headers"] = service_data.headers
    if service_data.tags is not None:
        update_data["tags"] = service_data.tags
    if service_data.email_alerts_enabled is not None:
        update_data["email_alerts_enabled"] = service_data.email_alerts_enabled

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.services.update_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")

    service = await db.services.find_one({"_id": ObjectId(service_id)})

    return ServiceResponse(
        id=str(service["_id"]),
        name=service["name"],
        health_check_url=service["health_check_url"],
        description=service.get("description", ""),
        is_active=service["is_active"],
        headers=service.get("headers"),
        tags=service.get("tags"),
        email_alerts_enabled=service.get("email_alerts_enabled", False),
        created_at=service["created_at"],
        updated_at=service["updated_at"],
    )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: str, authorization: str = Header(None)):
    """Delete service (soft delete)"""
    user = await get_current_user_from_header(authorization)

    if not is_valid_object_id(user["id"]) or not is_valid_object_id(service_id):
        raise HTTPException(status_code=404, detail="Service not found")

    from app.database import get_db
    db = get_db()

    result = await db.services.update_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
