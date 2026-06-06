# ============================================
# SalesFlow CRM - User Model
# ============================================
# This file defines the User table in the database.
# SQLAlchemy maps this Python class to a PostgreSQL table.

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from connection.database import Base


class User(Base):
    """
    User model - represents the 'users' table in PostgreSQL.
    
    Each attribute with Column() becomes a column in the database table.
    
    Table Structure:
    ┌──────────────┬──────────────┬─────────────────────────┐
    │ Column       │ Type         │ Description             │
    ├──────────────┼──────────────┼─────────────────────────┤
    │ id           │ INTEGER      │ Primary key, auto-inc   │
    │ full_name    │ VARCHAR(100) │ User's full name        │
    │ email        │ VARCHAR(255) │ Unique email address    │
    │ password_hash│ VARCHAR(255) │ Bcrypt hashed password  │
    │ created_at   │ TIMESTAMP    │ Account creation time   │
    └──────────────┴──────────────┴─────────────────────────┘
    """

    # Name of the table in PostgreSQL
    __tablename__ = "users"

    # --- Columns ---
    
    # Primary key: auto-incrementing integer ID
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # User's full name (required, max 100 characters)
    full_name = Column(String(100), nullable=False)
    
    # Email address (required, unique, max 255 characters)
    # 'unique=True' ensures no two users can have the same email
    # 'index=True' speeds up email lookups (used during login)
    email = Column(String(255), unique=True, index=True, nullable=False)
    
    # Hashed password (we NEVER store plain-text passwords!)
    password_hash = Column(String(255), nullable=False)
    
    # Timestamp of when the account was created
    # 'server_default=func.now()' lets PostgreSQL set this automatically
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        """String representation for debugging"""
        return f"<User(id={self.id}, email='{self.email}')>"
