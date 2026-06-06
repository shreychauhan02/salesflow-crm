# ============================================
# SalesFlow CRM - Utility Helpers
# ============================================
# This file contains reusable helper functions
# used across different parts of the application.

from datetime import datetime, timezone


def get_current_timestamp() -> datetime:
    """
    Get the current UTC timestamp.
    
    Returns:
        Current datetime in UTC timezone
        
    Example:
        now = get_current_timestamp()
        print(now)  # 2026-06-06 12:00:00+00:00
    """
    return datetime.now(timezone.utc)


def format_datetime(dt: datetime) -> str:
    """
    Format a datetime object into a human-readable string.
    
    Args:
        dt: A datetime object
        
    Returns:
        Formatted string like "June 06, 2026 12:00 PM"
        
    Example:
        formatted = format_datetime(some_datetime)
        print(formatted)  # "June 06, 2026 12:00 PM"
    """
    return dt.strftime("%B %d, %Y %I:%M %p")
