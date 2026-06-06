# ============================================
# SalesFlow CRM - Authentication Router
# ============================================
# This file defines the API endpoints for user authentication.
#
# Endpoints:
# POST /register  → Create a new user account
# POST /login     → Login and get a JWT token
# GET  /me        → Get current user's profile (protected)
#
# HOW FASTAPI ROUTING WORKS:
# 1. Client sends HTTP request (e.g., POST /register)
# 2. FastAPI matches it to the correct function
# 3. Pydantic validates the request data
# 4. The function processes the request
# 5. FastAPI returns the response as JSON

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from connection.database import get_db
from schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from services.user_service import create_user, authenticate_user
from auth.jwt_handler import get_current_user
from models.user import User

# Create a router instance
# 'tags' groups endpoints together in the Swagger docs
router = APIRouter(tags=["Authentication"])


# ============================================
# POST /register - Create a new user
# ============================================
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with full name, email, and password."
)
def register_user(
    user_data: UserCreate,         # Request body (validated by Pydantic)
    db: Session = Depends(get_db)  # Database session (injected by FastAPI)
):
    """
    Register a new user account.
    
    **Request Body:**
    - `full_name`: User's full name (2-100 characters)
    - `email`: Valid email address (must be unique)
    - `password`: Password (minimum 6 characters)
    
    **Returns:** The created user's profile (without password)
    
    **Errors:**
    - `400`: Email already registered
    - `422`: Validation error (invalid input)
    """
    # Call the service layer to handle business logic
    new_user = create_user(db=db, user_data=user_data)
    return new_user


# ============================================
# POST /login - Authenticate and get JWT token
# ============================================
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user",
    description="Authenticate with email and password to receive a JWT token."
)
def login_user(
    credentials: UserLogin,        # Request body with email + password
    db: Session = Depends(get_db)  # Database session
):
    """
    Login and receive a JWT access token.
    
    **Request Body:**
    - `email`: Registered email address
    - `password`: Account password
    
    **Returns:** JWT access token
    
    **Errors:**
    - `401`: Incorrect email or password
    
    **Usage:** Include the token in subsequent requests:
    ```
    Authorization: Bearer <your-token-here>
    ```
    """
    # Authenticate and get token from service layer
    token = authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password
    )
    return token


# ============================================
# GET /me - Get current user profile (PROTECTED)
# ============================================
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user."
)
def get_me(
    current_user: User = Depends(get_current_user)  # Injected by JWT verification
):
    """
    Get the authenticated user's profile.
    
    **Authorization:** Bearer token required in the header.
    
    **Returns:** Current user's profile data
    
    **Errors:**
    - `401`: Invalid or missing token
    
    **Note:** This is a PROTECTED route. You must include a valid JWT
    token in the Authorization header to access it.
    """
    # The 'get_current_user' dependency already verified the token
    # and fetched the user from the database, so we just return it!
    return current_user
