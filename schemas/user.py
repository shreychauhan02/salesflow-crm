# ============================================
# SalesFlow CRM - User Schemas (Pydantic)
# ============================================
# Schemas define the SHAPE of data coming in (requests)
# and going out (responses) of our API.
#
# Think of schemas as "contracts":
# - What data must the client send? (Request schemas)
# - What data will the server return? (Response schemas)

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ============================================
# REQUEST SCHEMAS (data coming IN from client)
# ============================================

class UserCreate(BaseModel):
    """
    Schema for user registration (POST /register).
    
    The client must send:
    - full_name: between 2-100 characters
    - email: a valid email address
    - password: at least 6 characters
    """
    full_name: str = Field(
        ...,  # '...' means this field is REQUIRED
        min_length=2,
        max_length=100,
        example="John Doe",
        description="User's full name"
    )
    email: EmailStr = Field(
        ...,
        example="john@example.com",
        description="User's email address (must be unique)"
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        example="securepassword123",
        description="User's password (minimum 6 characters)"
    )


class UserLogin(BaseModel):
    """
    Schema for user login (POST /login).
    
    The client must send:
    - email: the registered email
    - password: the account password
    """
    email: EmailStr = Field(
        ...,
        example="john@example.com",
        description="Registered email address"
    )
    password: str = Field(
        ...,
        example="securepassword123",
        description="Account password"
    )


# ============================================
# RESPONSE SCHEMAS (data going OUT to client)
# ============================================

class UserResponse(BaseModel):
    """
    Schema for user data in API responses.
    
    IMPORTANT: We NEVER include the password in responses!
    This schema controls exactly what user data the client sees.
    """
    id: int
    full_name: str
    email: str
    created_at: datetime

    class Config:
        # This tells Pydantic to read data from SQLAlchemy model attributes
        # Without this, Pydantic can't convert SQLAlchemy objects to JSON
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Schema for the JWT token returned after login/register.
    
    The client receives:
    - access_token: the JWT string to use in Authorization header
    - token_type: always "bearer" (OAuth2 standard)
    """
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """
    Generic message response for simple API replies.
    
    Example: {"message": "User registered successfully"}
    """
    message: str
