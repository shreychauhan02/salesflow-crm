# ============================================
# SalesFlow CRM - Main Application Entry Point
# ============================================
# This is the STARTING POINT of the entire application.
# FastAPI reads this file to know what routes exist
# and how to configure the app.
#
# To run the app:
#   uvicorn main:app --reload
#
# Then open:
#   http://127.0.0.1:8000       → API root
#   http://127.0.0.1:8000/docs  → Swagger UI (interactive API docs)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from connection.database import Base, engine
from routers.auth_router import router as auth_router
from routers.lead_router import router as lead_router
from routers.opportunity_router import router as opportunity_router

# Import ALL models so Base.metadata.create_all() can find them
from models.user import User          # noqa: F401
from models.lead import Lead          # noqa: F401
from models.opportunity import Opportunity  # noqa: F401

# --- Step 1: Create all database tables ---
# This checks all models that inherit from Base and creates
# their tables in PostgreSQL if they don't already exist.
# NOTE: In production, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

# --- Step 2: Create the FastAPI application ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    🚀 **SalesFlow CRM API** - A Salesforce-inspired CRM backend.
    
    ## Features
    - 🔐 **User Authentication** - Register, Login, JWT tokens
    - 👤 **User Management** - Profile management
    - 📋 **Lead Management** - Create, update, search, filter, convert leads
    - 💰 **Opportunity Management** - Track deals, stages, and approvals
    - ✅ **Approval Workflow** - Auto-approval for deals ≤ ₹1L, manager approval for > ₹1L
    
    ## Authentication
    1. Register a new account using `POST /register`
    2. Login with your credentials using `POST /login`
    3. Use the returned JWT token in the `Authorization` header:
       ```
       Authorization: Bearer <your-token>
       ```
    
    ## Business Flows
    - **Lead Conversion:** Lead (Qualified) → Convert → Opportunity Created
    - **Approval:** Deal > ₹1,00,000 → Pending → Manager Approves/Rejects
    """,
    docs_url="/docs",        # Swagger UI URL
    redoc_url="/redoc",      # ReDoc URL (alternative docs)
)

# --- Step 3: Configure CORS (Cross-Origin Resource Sharing) ---
# CORS allows your frontend (e.g., React on port 3000) to
# communicate with this backend (on port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Which domains can access the API
    allow_credentials=True,        # Allow cookies and auth headers
    allow_methods=["*"],           # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],           # Allow all headers
)

# --- Step 4: Register Routers ---
# Include all routers - each one adds its endpoints to the app
app.include_router(auth_router)           # /register, /login, /me
app.include_router(lead_router)           # /leads/*
app.include_router(opportunity_router)    # /opportunities/*


# --- Step 5: Root Endpoint ---
@app.get(
    "/",
    tags=["Root"],
    summary="API Health Check",
    description="Returns basic API information and health status."
)
def root():
    """
    Root endpoint - confirms the API is running.
    
    Returns a welcome message with API details.
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


# --- Step 6: Health Check Endpoint ---
@app.get(
    "/health",
    tags=["Root"],
    summary="Health Check",
    description="Simple health check to verify the API is operational."
)
def health_check():
    """
    Health check endpoint for monitoring.
    
    Use this endpoint to verify the API is up and responding.
    """
    return {"status": "healthy"}
