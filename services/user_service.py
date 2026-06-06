# ============================================
# SalesFlow CRM - User Service (Business Logic)
# ============================================
# This file contains all the BUSINESS LOGIC for user operations.
#
# WHY SEPARATE SERVICES FROM ROUTES?
# - Routes handle HTTP stuff (requests, responses, status codes)
# - Services handle business logic (database queries, validation)
# - This separation makes code cleaner, testable, and reusable
#
# Flow: Client → Router → Service → Database

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User
from schemas.user import UserCreate
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Register a new user in the database.
    
    Steps:
    1. Check if email already exists
    2. Hash the password
    3. Create the user record
    4. Save to database
    
    Args:
        db: Database session
        user_data: Validated registration data (from Pydantic schema)
        
    Returns:
        The newly created User object
        
    Raises:
        HTTPException 400: If email is already registered
    """
    # Step 1: Check if a user with this email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Step 2: Hash the password (NEVER store plain text!)
    hashed_pw = hash_password(user_data.password)
    
    # Step 3: Create a new User object
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_pw,
    )
    
    # Step 4: Add to database and commit the transaction
    db.add(new_user)       # Stage the new user
    db.commit()            # Save changes to PostgreSQL
    db.refresh(new_user)   # Reload the object with DB-generated values (id, created_at)
    
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> dict:
    """
    Authenticate a user and return a JWT token.
    
    Steps:
    1. Find the user by email
    2. Verify the password
    3. Generate a JWT token
    
    Args:
        db: Database session
        email: User's email address
        password: User's plain-text password
        
    Returns:
        Dictionary with access_token and token_type
        
    Raises:
        HTTPException 401: If email or password is incorrect
    """
    # Step 1: Find the user by email
    user = db.query(User).filter(User.email == email).first()
    
    # Step 2: Verify credentials
    # NOTE: We use the same error message for both cases
    # This prevents attackers from knowing if an email exists
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Step 3: Generate JWT token with user's email as the subject
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


def get_user_by_id(db: Session, user_id: int) -> User:
    """
    Fetch a user by their ID.
    
    Args:
        db: Database session
        user_id: The user's ID
        
    Returns:
        The User object if found
        
    Raises:
        HTTPException 404: If user not found
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
