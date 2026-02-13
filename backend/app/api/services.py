"""Service Management Endpoints"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse, ServiceDetailResponse
from app.database import get_db
from app.models.service import Service
from app.services.auth_service import AuthService
from app.services.health_service import HealthCheckService
from bson import ObjectId

router = APIRouter(prefix="/services", tags=["Services"])


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


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    service_data: ServiceCreate, authorization: str = None
):
    """Create a new service to monitor"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    service = Service(
        user_id=ObjectId(user["id"]),
        name=service_data.name,
        health_check_url=str(service_data.health_check_url),
        description=service_data.description,
    )
    
    result = await db.services.insert_one(service.to_dict())
    
    return ServiceResponse(
        id=str(result.inserted_id),
        name=service.name,
        health_check_url=service.health_check_url,
        description=service.description,
        is_active=service.is_active,
        created_at=service.created_at,
        updated_at=service.updated_at,
    )


@router.get("", response_model=List[ServiceResponse])
async def list_services(authorization: str = None):
    """List all services for user"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    services = list(
        await db.services.find({"user_id": ObjectId(user["id"]), "is_active": True})
        .to_list(1000)
    )
    
    return [
        ServiceResponse(
            id=str(s["_id"]),
            name=s["name"],
            health_check_url=s["health_check_url"],
            description=s["description"],
            is_active=s["is_active"],
            created_at=s["created_at"],
            updated_at=s["updated_at"],
        )
        for s in services
    ]


@router.get("/{service_id}", response_model=ServiceDetailResponse)
async def get_service_details(service_id: str, authorization: str = None):
    """Get service details with current metrics"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    service = await db.services.find_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])}
    )
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get metrics
    metrics = await HealthCheckService.get_service_metrics(service_id)
    
    return ServiceDetailResponse(
        id=str(service["_id"]),
        name=service["name"],
        health_check_url=service["health_check_url"],
        description=service["description"],
        is_active=service["is_active"],
        created_at=service["created_at"],
        updated_at=service["updated_at"],
        current_status=metrics["current_status"],
        last_check_at=metrics.get("last_check_at"),
        uptime_percentage=metrics["uptime_percentage"],
        avg_response_time_ms=metrics["avg_response_time_ms"],
    )


@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str, service_data: ServiceUpdate, authorization: str = None
):
    """Update service"""
    user = await get_current_user_from_header(authorization)
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
    
    update_data["updated_at"] = __import__("datetime").datetime.utcnow()
    
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
        description=service["description"],
        is_active=service["is_active"],
        created_at=service["created_at"],
        updated_at=service["updated_at"],
    )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: str, authorization: str = None):
    """Delete service (soft delete)"""
    user = await get_current_user_from_header(authorization)
    db = get_db()
    
    result = await db.services.update_one(
        {"_id": ObjectId(service_id), "user_id": ObjectId(user["id"])},
        {
            "$set": {
                "is_active": False,
                "updated_at": __import__("datetime").datetime.utcnow(),
            }
        },
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
