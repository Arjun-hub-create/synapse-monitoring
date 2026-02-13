"""User Schemas"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """User registration schema"""

    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    full_name: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "John Doe",
            }
        }


class UserLogin(BaseModel):
    """User login schema"""

    email: EmailStr
    password: str = Field(..., description="Password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
            }
        }


class UserResponse(BaseModel):
    """User response schema"""

    id: Optional[str] = None
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "created_at": "2024-01-15T12:30:45",
            }
        }


class TokenResponse(BaseModel):
    """Token response schema"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
            }
        }

class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema"""

    email: EmailStr

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
            }
        }


class ResetPasswordRequest(BaseModel):
    """Reset password request schema"""

    email: EmailStr
    reset_token: str
    new_password: str = Field(..., min_length=6, description="New password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "reset_token": "token_here",
                "new_password": "newpassword123",
            }
        }