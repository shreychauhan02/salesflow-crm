# ============================================
# SalesFlow CRM - Application Configuration
# ============================================
# This file loads all settings from the .env file
# using Pydantic's BaseSettings for type-safe config.

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.
    
    Pydantic's BaseSettings automatically reads values from:
    1. Environment variables (highest priority)
    2. .env file (fallback)
    """

    # --- Database ---
    DATABASE_URL: str  # PostgreSQL connection string

    # --- JWT Authentication ---
    SECRET_KEY: str            # Secret key used to sign JWT tokens
    ALGORITHM: str = "HS256"   # JWT signing algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token expiry time in minutes

    # --- App Info ---
    APP_NAME: str = "SalesFlow CRM"
    APP_VERSION: str = "1.0.0"

    class Config:
        # Tell Pydantic to load values from the .env file
        env_file = ".env"


# Create a single settings instance to use across the app
# This is called once and reused everywhere (singleton pattern)
settings = Settings()
