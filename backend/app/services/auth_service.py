"""Authentication Service"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import settings
from app.database import get_db
from app.models.user import User
from bson import ObjectId

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    """Authentication and JWT token management"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using argon2 (no length limit)"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            return None

    @staticmethod
    async def register_user(email: str, password: str, full_name: str) -> dict:
        """Register new user"""
        db = get_db()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create new user
        user = User(
            email=email,
            hashed_password=AuthService.hash_password(password),
            full_name=full_name,
        )
        
        result = await db.users.insert_one(user.to_dict())
        return {"id": str(result.inserted_id), "email": email, "full_name": full_name}

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user and return tokens"""
        db = get_db()
        user_doc = await db.users.find_one({"email": email})
        
        if not user_doc:
            return None
        
        if not AuthService.verify_password(password, user_doc["hashed_password"]):
            return None
        
        if not user_doc.get("is_active", False):
            return None
        
        # Create tokens
        access_token = AuthService.create_token(
            data={"sub": str(user_doc["_id"]), "email": email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        
        refresh_token = AuthService.create_token(
            data={"sub": str(user_doc["_id"]), "email": email, "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": str(user_doc["_id"]),
        }

    @staticmethod
    async def get_current_user(token: str) -> Optional[dict]:
        """Get current user from token"""
        payload = AuthService.verify_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        db = get_db()
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
            if not user_doc:
                return None
            return {
                "id": str(user_doc["_id"]),
                "email": user_doc["email"],
                "full_name": user_doc["full_name"],
            }
        except Exception:
            return None
    @staticmethod
    async def request_password_reset(email: str) -> dict:
        """Request password reset for user"""
        db = get_db()
        user_doc = await db.users.find_one({"email": email})
        
        if not user_doc:
            # Don't reveal if user exists for security
            return {"message": "If email exists, password reset link has been sent"}
        
        # Create reset token (valid for 24 hours)
        reset_token = AuthService.create_token(
            data={"sub": str(user_doc["_id"]), "email": email, "type": "reset"},
            expires_delta=timedelta(hours=24),
        )
        
        # Store reset token in database
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"reset_token": reset_token, "reset_token_created": datetime.now(timezone.utc)}}
        )
        
        return {"message": "If email exists, password reset link has been sent"}

    @staticmethod
    async def reset_password(email: str, reset_token: str, new_password: str) -> dict:
        """Reset user password with valid reset token"""
        # Verify reset token
        payload = AuthService.verify_token(reset_token)
        if not payload or payload.get("type") != "reset":
            raise ValueError("Invalid or expired reset token")
        
        db = get_db()
        user_doc = await db.users.find_one({"email": email})
        
        if not user_doc:
            raise ValueError("User not found")
        
        # Verify token matches stored token
        if user_doc.get("reset_token") != reset_token:
            raise ValueError("Invalid reset token")
        
        # Update password and clear reset token
        new_hashed_password = AuthService.hash_password(new_password)
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"hashed_password": new_hashed_password}, "$unset": {"reset_token": "", "reset_token_created": ""}}
        )
        
        return {"message": "Password reset successful"}