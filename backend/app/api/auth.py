"""Authentication Endpoints"""
from fastapi import APIRouter, HTTPException, Depends, status
import logging
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        result = await AuthService.register_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
        )
        return {"message": "User registered successfully", "data": result}
    except ValueError as e:
        logger.warning(f"Registration validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and get tokens"""
    try:
        result = await AuthService.authenticate_user(
            email=credentials.email, password=credentials.password
        )
        
        if not result:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type="bearer",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(lambda: None)):
    """Get current user profile"""
    # This will be called with Authorization header
    # Implementation in main.py with Depends
    raise HTTPException(status_code=401, detail="Not authenticated")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    payload = AuthService.verify_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    new_access_token = AuthService.create_token(
        data={"sub": payload["sub"], "email": payload.get("email")}
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )

@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    result = await AuthService.request_password_reset(email=request.email)
    return result


@router.post("/reset-password", response_model=dict)
async def reset_password(request: ResetPasswordRequest):
    """Reset password with reset token"""
    try:
        result = await AuthService.reset_password(
            email=request.email,
            reset_token=request.reset_token,
            new_password=request.new_password,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Password reset failed")