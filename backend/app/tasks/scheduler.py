"""Health Check Scheduler"""
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from app.database import get_db
from app.services.health_service import HealthCheckService
from app.services.alert_service import AlertService
from app.config import settings
from bson import ObjectId

scheduler = AsyncIOScheduler()


async def health_check_job():
    """Scheduled job to perform health checks"""
    try:
        db = get_db()
        services = list(await db.services.find({"is_active": True}).to_list(10000))
        
        print(f"[{datetime.utcnow().isoformat()}] Starting health checks for {len(services)} services")
        
        tasks = []
        for service in services:
            task = perform_service_check(service)
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks)
        
        print(f"[{datetime.utcnow().isoformat()}] Completed health checks")
    except Exception as e:
        print(f"Health check job error: {e}")


async def perform_service_check(service: dict):
    """Perform health check for a single service"""
    try:
        service_id = str(service["_id"])
        health_check_url = service["health_check_url"]
        user_id = str(service["user_id"])
        
        # Perform check
        check_data = await HealthCheckService.perform_health_check(
            service_id, health_check_url
        )
        
        # Record check
        await HealthCheckService.record_health_check(service_id, check_data)
        
        # Check for failures and create alerts
        if check_data["status"] != "healthy":
            await AlertService.check_for_service_failures(service_id, user_id)
        else:
            # Resolve existing alerts if service is back to healthy
            await AlertService.resolve_service_alerts(service_id)
        
        print(f"  ✓ {service['name']}: {check_data['status']}")
        
    except Exception as e:
        print(f"  ✗ Error checking {service.get('name', 'Unknown')}: {e}")


def start_scheduler():
    """Start the background scheduler"""
    try:
        scheduler.add_job(
            health_check_job,
            "interval",
            seconds=settings.HEALTH_CHECK_INTERVAL_SECONDS,
            id="health_check_job",
            name="Periodic Health Checks",
        )
        scheduler.start()
        print(f"✓ Scheduler started: Health checks every {settings.HEALTH_CHECK_INTERVAL_SECONDS}s")
    except Exception as e:
        print(f"✗ Failed to start scheduler: {e}")


def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("✓ Scheduler stopped")
