"""Main FastAPI Application"""
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, init_indexes
from app.tasks.scheduler import start_scheduler, stop_scheduler
from app.middleware.error_handler import global_exception_handler
from app.api import auth, services, health, alerts, websocket

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Lifecycle events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app startup and shutdown"""
    # Startup
    print("\n" + "="*60)
    print("Starting Synapse Backend")
    print("="*60)
    
    try:
        await connect_to_mongo()
        await init_indexes()
    except Exception as e:
        print(f"MongoDB connection failed: {str(e)}")
        print("Running in demo mode without persistence")
    
    start_scheduler()
    
    print("="*60)
    print("Backend ready at http://0.0.0.0:8000")
    print("API Docs: http://localhost:8000/api/v1/docs")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown
    print("\n" + "="*60)
    print("Shutting down Synapse Backend")
    print("="*60)
    
    stop_scheduler()
    try:
        await close_mongo_connection()
    except:
        pass
    
    print("="*60 + "\n")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Real-time System Monitoring Platform",
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(services.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(websocket.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": f"{settings.API_PREFIX}/docs",
        "redoc": f"{settings.API_PREFIX}/redoc",
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check"""
    return {"status": "ok", "service": settings.APP_NAME}


# Exception handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    return await global_exception_handler(request, exc)


# Serve static frontend files
frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    # Mount static assets (CSS, JS, images)
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
    
    # Serve index.html for SPA routing
    from fastapi.responses import FileResponse
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA - return index.html for all non-API routes"""
        # Don't serve SPA for API routes
        if full_path.startswith("api/"):
            return {"error": "Not Found"}, 404
        
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Frontend not found"}, 404
    
    logger.info(f"Serving frontend SPA from {frontend_dist}")
else:
    logger.warning(f"Frontend dist directory not found at {frontend_dist}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
