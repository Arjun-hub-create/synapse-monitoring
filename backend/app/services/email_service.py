"""Email Service for Alerts"""
import smtplib
from email.message import EmailMessage
import logging
import asyncio

from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email_sync(to_email: str, subject: str, content: str) -> bool:
        """Send an email synchronously using SMTP"""
        if not settings.SMTP_HOST:
            logger.info(f"Email Alerts (Mock) -> To: {to_email} | Subject: {subject} | Content: {content}")
            return True

        try:
            msg = EmailMessage()
            msg.set_content(content)
            msg['Subject'] = subject
            msg['From'] = settings.EMAILS_FROM_EMAIL
            msg['To'] = to_email

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Successfully sent email alert to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email alert to {to_email}: {e}")
            return False

    @staticmethod
    async def send_email(to_email: str, subject: str, content: str) -> bool:
        """Send an email asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, EmailService.send_email_sync, to_email, subject, content)
