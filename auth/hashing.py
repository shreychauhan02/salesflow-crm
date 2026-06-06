# ============================================
# SalesFlow CRM - Password Hashing
# ============================================
# This file handles password security using bcrypt.
#
# WHY HASH PASSWORDS?
# - We NEVER store plain-text passwords in the database
# - Hashing is a one-way function: password → hash (can't reverse it)
# - Even if the database is compromised, passwords stay safe
#
# HOW BCRYPT WORKS:
# 1. User enters "mypassword123"
# 2. Bcrypt converts it to something like "$2b$12$LJ3m4..."
# 3. We store the hash in the database
# 4. During login, we hash the input and compare with stored hash

from passlib.context import CryptContext

# Create a password hashing context using bcrypt
# - schemes=["bcrypt"]: Use the bcrypt algorithm
# - deprecated="auto": Automatically handle old hash formats
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    
    Args:
        password: The plain-text password from the user
        
    Returns:
        A bcrypt hash string (e.g., "$2b$12$LJ3m4...")
        
    Example:
        hashed = hash_password("mypassword123")
        # Returns: "$2b$12$randomsaltandhashhere..."
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored hash.
    
    Args:
        plain_password: The password the user typed in
        hashed_password: The hash stored in the database
        
    Returns:
        True if the password matches, False otherwise
        
    Example:
        is_valid = verify_password("mypassword123", stored_hash)
        # Returns: True or False
    """
    return pwd_context.verify(plain_password, hashed_password)
