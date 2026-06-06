# ============================================
# SalesFlow CRM - Database Initialization
# ============================================
# This file provides helper functions to initialize and
# manage the database. It re-exports key items from the
# connection module for convenience.

from connection.database import Base, engine, get_db


def create_tables():
    """
    Create all database tables defined by our SQLAlchemy models.
    
    This uses Base.metadata.create_all() which looks at all classes
    that inherit from Base and creates their corresponding tables
    if they don't already exist.
    
    NOTE: In production, you should use Alembic migrations instead
    of this function. This is mainly useful for initial development.
    """
    Base.metadata.create_all(bind=engine)


# Re-export for easy imports elsewhere
__all__ = ["Base", "engine", "get_db", "create_tables"]
