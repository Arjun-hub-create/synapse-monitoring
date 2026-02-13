"""User Model"""
from datetime import datetime
from typing import Optional
from bson import ObjectId


class User:
    """User database model"""

    def __init__(
        self,
        email: str,
        hashed_password: str,
        full_name: str,
        is_active: bool = True,
        _id: Optional[ObjectId] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self._id = _id or ObjectId()
        self.email = email
        self.hashed_password = hashed_password
        self.full_name = full_name
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "_id": self._id,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
