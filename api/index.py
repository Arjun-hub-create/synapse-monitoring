from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import all routes from the backend
import sys
sys.path.insert(0, '/var/task/backend')

from backend.app.main import app as fastapi_app

# The app instance for Vercel
app = fastapi_app

# Make sure CORS is properly configured for Vercel domain
frontend_url = os.getenv("FRONTEND_URL", "https://synapse-monitoring.vercel.app")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export the app
__all__ = ["app"]
