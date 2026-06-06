# ============================================
# SalesFlow CRM - JWT Token Handler
# ============================================
# This file handles creating and verifying JWT tokens.
#
# WHAT IS JWT?
# JWT = JSON Web Token
# It's like a "digital ID card" that proves who you are.
#
# HOW IT WORKS:
# 1. User logs in with email + password
# 2. Server creates a JWT token containing the user's ID
# 3. Client stores the token and sends it with every request
# 4. Server verifies the token to identify the user
#
# JWT Structure: header.payload.signature
# Example: eyJhbGciOi...eyJzdWIiOi...SflKxwRJSM...

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.config import settings
from connection.database import get_db
from models.user import User

# --- OAuth2 Password Bearer ---
# This tells FastAPI to look for the token in the Authorization header
# Format: "Authorization: Bearer <your-token>"
# The 'tokenUrl' points to the login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of claims to encode in the token
              Usually: {"sub": user_email}
        expires_delta: How long until the token expires
                       Defaults to ACCESS_TOKEN_EXPIRE_MINUTES from settings
    
    Returns:
        A JWT token string
        
    Example:
        token = create_access_token(data={"sub": "john@example.com"})
        # Returns: "eyJhbGciOiJIUzI1NiIs..."
    """
    # Copy the data so we don't modify the original
    to_encode = data.copy()
    
    # Set the expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Add expiration to the token payload
    to_encode.update({"exp": expire})
    
    # Create and return the JWT token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency that extracts and validates the current user from a JWT token.
    
    This is used to PROTECT routes - only authenticated users can access them.
    
    How it works:
    1. Extracts the JWT token from the Authorization header
    2. Decodes the token to get the user's email
    3. Looks up the user in the database
    4. Returns the user object (or raises 401 error)
    
    Usage in routes:
        @router.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            return current_user
    
    Args:
        token: JWT token from the Authorization header (auto-injected)
        db: Database session (auto-injected)
        
    Returns:
        The authenticated User object
        
    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    # Define the error to raise if authentication fails
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract the email from the 'sub' (subject) claim
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        # Token is invalid (expired, tampered with, etc.)
        raise credentials_exception
    
    # Look up the user in the database by email
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
    
    return user
