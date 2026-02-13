"""MongoDB Database Connection and Setup"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Any
import asyncio
from app.config import settings

# Global database instance
db: Any = None
client: Any = None


async def connect_to_mongo() -> None:
    """Initialize MongoDB connection"""
    global client, db
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DATABASE_NAME]
        # Verify connection
        await client.admin.command("ping")
        print(f"✓ Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection() -> None:
    """Close MongoDB connection"""
    global client, db
    if client:
        client.close()
        db = None
        print("✓ Closed MongoDB connection")


def get_db() -> Any:
    """Get database instance"""
    if db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongo() first.")
    return db


async def init_indexes() -> None:
    """Initialize database indexes"""
    db_instance = get_db()
    
    # Users collection indexes
    await db_instance.users.create_index("email", unique=True)
    await db_instance.users.create_index("created_at")
    
    # Services collection indexes
    await db_instance.services.create_index("user_id")
    await db_instance.services.create_index("name")
    await db_instance.services.create_index("created_at")
    
    # Health checks collection indexes
    await db_instance.health_checks.create_index("service_id")
    await db_instance.health_checks.create_index("timestamp")
    await db_instance.health_checks.create_index([("timestamp", -1)])
    await db_instance.health_checks.create_index([("service_id", 1), ("timestamp", -1)])
    
    # Alerts collection indexes
    await db_instance.alerts.create_index("service_id")
    await db_instance.alerts.create_index("user_id")
    await db_instance.alerts.create_index("created_at")
    await db_instance.alerts.create_index([("resolved", 1), ("created_at", -1)])
    
    # Logs collection indexes
    await db_instance.logs.create_index("service_id")
    await db_instance.logs.create_index("timestamp")
    await db_instance.logs.create_index([("timestamp", -1)])
    
    print("✓ Database indexes initialized")
