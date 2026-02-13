"""Authentication Service"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import settings
from bson import ObjectId

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# In-memory demo storage for when MongoDB is unavailable
DEMO_USERS_DB: Dict[str, dict] = {}


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
        """Register new user (with demo mode fallback)"""
        try:
            from app.database import get_db
            from app.models.user import User
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
        
        except ValueError:
            raise
        except (RuntimeError, Exception) as e:
            # Demo mode: use in-memory storage
            if email in DEMO_USERS_DB:
                raise ValueError("User with this email already exists")
            
            user_id = str(ObjectId())
            DEMO_USERS_DB[email] = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "hashed_password": AuthService.hash_password(password),
            }
            return {"id": user_id, "email": email, "full_name": full_name}

    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[dict]:
        """Authenticate user and return tokens"""
        user_id = None
        user_doc = None
        
        try:
            from app.database import get_db
            db = get_db()
            user_doc = await db.users.find_one({"email": email})
            
            if user_doc:
                user_id = str(user_doc["_id"])
        
        except (RuntimeError, Exception):
            # Demo mode: use in-memory storage
            if email in DEMO_USERS_DB:
                user_doc = DEMO_USERS_DB[email]
                user_id = user_doc["id"]
        
        # Verify user exists and password matches
        if not user_doc or not AuthService.verify_password(password, user_doc.get("hashed_password", "")):
            return None
        
        # Generate tokens
        access_token = AuthService.create_token(
            data={"sub": email, "id": user_id},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        refresh_token = AuthService.create_token(
            data={"sub": email, "id": user_id, "type": "refresh"},
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    @staticmethod
    async def get_current_user(token: str) -> Optional[dict]:
        """Get current user from token"""
        payload = AuthService.verify_token(token)
        if not payload:
            return None
        
        email = payload.get("sub")
        user_id = payload.get("id")
        
        if not email:
            return None
        
        try:
            from app.database import get_db
            db = get_db()
            user_doc = await db.users.find_one({"email": email})
            if user_doc:
                return {
                    "id": str(user_doc["_id"]),
                    "email": user_doc["email"],
                    "full_name": user_doc.get("full_name", ""),
                }
        except (RuntimeError, Exception):
            # Demo mode
            pass
        
        # Demo mode fallback
        if email in DEMO_USERS_DB:
            user_doc = DEMO_USERS_DB[email]
            return {
                "id": user_doc["id"],
                "email": user_doc["email"],
                "full_name": user_doc.get("full_name", ""),
            }
        
        return None

    @staticmethod
    async def request_password_reset(email: str) -> dict:
        """Request password reset for user"""
        try:
            from app.database import get_db
            db = get_db()
            user_doc = await db.users.find_one({"email": email})
            
            if user_doc:
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
        except (RuntimeError, Exception):
            # Demo mode - just return success message
            pass
        
        # Always return same message for security
        return {"message": "If email exists, password reset link has been sent"}

    @staticmethod
    async def reset_password(email: str, reset_token: str, new_password: str) -> dict:
        """Reset user password with valid reset token"""
        # Verify reset token
        payload = AuthService.verify_token(reset_token)
        if not payload or payload.get("type") != "reset":
            raise ValueError("Invalid or expired reset token")
        
        try:
            from app.database import get_db
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
        
        except (RuntimeError, Exception):
            # Demo mode - update in-memory storage
            if email in DEMO_USERS_DB:
                DEMO_USERS_DB[email]["hashed_password"] = AuthService.hash_password(new_password)
        
        return {"message": "Password reset successful"}
