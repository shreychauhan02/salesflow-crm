# ============================================
# SalesFlow CRM - Database Connection
# ============================================
# This file sets up the SQLAlchemy engine and session.
# Think of it as the "bridge" between Python and PostgreSQL.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

# --- Step 1: Create the Database Engine ---
# The engine is the starting point for any SQLAlchemy application.
# It manages the connection pool to your database.
# connect_args is needed for SQLite to work with FastAPI
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True to see SQL queries in the console (useful for debugging)
    connect_args=connect_args,
)

# --- Step 2: Create a Session Factory ---
# A session is like a "conversation" with the database.
# SessionLocal is a factory that creates new session objects.
SessionLocal = sessionmaker(
    autocommit=False,  # We want to manually commit transactions
    autoflush=False,   # Don't automatically flush changes to the DB
    bind=engine,       # Connect sessions to our engine
)

# --- Step 3: Create a Base Class for Models ---
# All our database models (tables) will inherit from this Base class.
# It provides the mapping between Python classes and database tables.
Base = declarative_base()


# --- Step 4: Dependency Injection for Database Sessions ---
def get_db():
    """
    FastAPI dependency that provides a database session.
    
    How it works:
    1. Creates a new database session
    2. Gives it to the route handler (via 'yield')
    3. Automatically closes the session when the request is done
    
    Usage in routes:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            # use 'db' to query the database
            pass
    """
    db = SessionLocal()
    try:
        yield db  # Provide the session to the route
    finally:
        db.close()  # Always close the session, even if an error occurs
