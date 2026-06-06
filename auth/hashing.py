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

import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    
    Args:
        password: The plain-text password from the user
        
    Returns:
        A bcrypt hash string (e.g., "$2b$12$LJ3m4...")
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored hash.
    
    Args:
        plain_password: The password the user typed in
        hashed_password: The hash stored in the database
        
    Returns:
        True if the password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
