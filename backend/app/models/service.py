"""Service Model"""
from datetime import datetime
from typing import Optional
from bson import ObjectId


class Service:
    """Service registration model"""

    def __init__(
        self,
        user_id: ObjectId,
        name: str,
        health_check_url: str,
        description: str = "",
        is_active: bool = True,
        _id: Optional[ObjectId] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self._id = _id or ObjectId()
        self.user_id = user_id
        self.name = name
        self.health_check_url = health_check_url
        self.description = description
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "name": self.name,
            "health_check_url": self.health_check_url,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
