"""Error Handling Middleware"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
import traceback
from datetime import datetime


class ErrorResponse:
    """Standard error response"""

    def __init__(self, error_code: str, message: str, status_code: int):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> dict:
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "timestamp": self.timestamp,
            }
        }


async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for all unhandled errors"""
    error_code = "INTERNAL_SERVER_ERROR"
    message = "An unexpected error occurred"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    # Log error with traceback
    print(f"\n{'='*60}")
    print(f"ERROR at {request.url}")
    print(f"Method: {request.method}")
    print(f"{'='*60}")
    traceback.print_exc()
    print(f"{'='*60}\n")

    error_response = ErrorResponse(error_code, message, status_code)
    return JSONResponse(
        status_code=status_code,
        content=error_response.to_dict(),
    )


async def http_exception_handler(request: Request, exc: Exception):
    """Handle HTTP exceptions"""
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", "Unknown error")

    error_code = "HTTP_ERROR"
    error_response = ErrorResponse(error_code, detail, status_code)

    return JSONResponse(
        status_code=status_code,
        content=error_response.to_dict(),
    )
