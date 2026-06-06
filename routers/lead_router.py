# ============================================
# SalesFlow CRM - Lead Router (API Endpoints)
# ============================================
# This file defines all API endpoints for Lead management.
#
# ENDPOINTS:
# POST   /leads              → Create a new lead
# GET    /leads              → List all leads (with filters)
# GET    /leads/search       → Search leads by criteria
# GET    /leads/{id}         → Get a single lead
# PUT    /leads/{id}         → Update a lead
# DELETE /leads/{id}         → Delete a lead
# POST   /leads/{id}/convert → Convert lead to opportunity ⭐
#
# ALL ROUTES ARE PROTECTED - User must be logged in (JWT required)

from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from connection.database import get_db
from auth.jwt_handler import get_current_user
from models.user import User
from models.lead import LeadStatus
from schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadConvertResponse,
)
from services.lead_service import (
    create_lead,
    get_lead_by_id,
    update_lead,
    delete_lead,
    list_leads,
    search_leads,
    convert_lead_to_opportunity,
)

# Create router with prefix and tags
# All endpoints in this file will start with /leads
router = APIRouter(
    prefix="/leads",
    tags=["Leads"],
)


# ============================================
# POST /leads - Create a new lead
# ============================================
@router.post(
    "/",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lead",
    description="Add a new potential customer (lead) to the CRM system."
)
def create_new_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new lead.
    
    The lead is automatically assigned to the logged-in user.
    Status is set to "New" by default.
    
    **Authorization:** Bearer token required.
    """
    return create_lead(db=db, lead_data=lead_data, owner_id=current_user.id)


# ============================================
# GET /leads - List all leads (with filters)
# ============================================
@router.get(
    "/",
    response_model=List[LeadResponse],
    summary="List all leads",
    description="Get all leads with optional filtering by status and source."
)
def get_all_leads(
    status_filter: Optional[LeadStatus] = Query(
        None, alias="status", description="Filter by status: New, Contacted, Qualified, Lost, Converted"
    ),
    source: Optional[str] = Query(
        None, description="Filter by source (partial match)"
    ),
    skip: int = Query(0, ge=0, description="Records to skip (for pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all leads with optional filtering and pagination.
    
    **Query Parameters:**
    - `status`: Filter by lead status (New, Contacted, Qualified, Lost, Converted)
    - `source`: Filter by lead source (partial match, e.g., "Web" matches "Website")
    - `skip`: Number of records to skip (default: 0)
    - `limit`: Max records per page (default: 100, max: 500)
    
    **Authorization:** Bearer token required.
    """
    return list_leads(
        db=db,
        status_filter=status_filter,
        source_filter=source,
        skip=skip,
        limit=limit,
    )


# ============================================
# GET /leads/search - Search leads
# ============================================
@router.get(
    "/search",
    response_model=List[LeadResponse],
    summary="Search leads",
    description="Search leads by name, email, company, status, or source."
)
def search_all_leads(
    name: Optional[str] = Query(None, description="Search by name (partial match)"),
    email: Optional[str] = Query(None, description="Search by email (partial match)"),
    company: Optional[str] = Query(None, description="Search by company (partial match)"),
    status_filter: Optional[LeadStatus] = Query(None, alias="status", description="Filter by status"),
    source: Optional[str] = Query(None, description="Search by source (partial match)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search leads by multiple criteria.
    
    All search parameters use case-insensitive partial matching.
    For example, name="rah" will match "Rahul", "RAHUL", etc.
    
    **Authorization:** Bearer token required.
    """
    return search_leads(
        db=db,
        name=name,
        email=email,
        company=company,
        status_filter=status_filter,
        source=source,
    )


# ============================================
# GET /leads/{id} - Get a single lead
# ============================================
@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get a lead by ID",
    description="Fetch a single lead's details by their ID."
)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single lead by ID.
    
    **Path Parameter:**
    - `lead_id`: The ID of the lead to fetch
    
    **Authorization:** Bearer token required.
    """
    return get_lead_by_id(db=db, lead_id=lead_id)


# ============================================
# PUT /leads/{id} - Update a lead
# ============================================
@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update a lead",
    description="Update an existing lead's information. Only send the fields you want to change."
)
def update_existing_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a lead's information (partial update).
    
    Only the fields included in the request body will be updated.
    Fields not included will remain unchanged.
    
    **Authorization:** Bearer token required.
    """
    return update_lead(db=db, lead_id=lead_id, lead_data=lead_data)


# ============================================
# DELETE /leads/{id} - Delete a lead
# ============================================
@router.delete(
    "/{lead_id}",
    summary="Delete a lead",
    description="Permanently remove a lead from the system."
)
def delete_existing_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a lead by ID.
    
    **Warning:** This action is permanent and cannot be undone.
    
    **Authorization:** Bearer token required.
    """
    return delete_lead(db=db, lead_id=lead_id)


# ============================================
# POST /leads/{id}/convert - Convert Lead → Opportunity ⭐
# ============================================
@router.post(
    "/{lead_id}/convert",
    response_model=LeadConvertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Convert lead to opportunity",
    description="""
    Convert a qualified lead into an opportunity (deal).
    
    **Business Rules:**
    - Only leads with status 'Qualified' can be converted
    - A new Opportunity is automatically created
    - If deal_value > ₹1,00,000 → approval_status = 'Pending'
    - Lead status changes to 'Converted'
    """
)
def convert_lead(
    lead_id: int,
    opportunity_name: str = Query(
        ...,
        min_length=2,
        max_length=200,
        description="Name for the new opportunity",
        example="Acme Corp - Enterprise Plan",
    ),
    deal_value: float = Query(
        ...,
        ge=0,
        description="Value of the deal in rupees",
        example=150000.0,
    ),
    expected_close_date: Optional[date] = Query(
        None,
        description="Expected date to close the deal (YYYY-MM-DD)",
        example="2026-08-15",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ⭐ Convert a qualified lead into an opportunity.
    
    **Flow:**
    ```
    Lead (Qualified) → Convert → Opportunity Created
                                 └─ deal > ₹1L → Pending Approval
                                 └─ deal ≤ ₹1L → Auto Approved
    ```
    
    **Authorization:** Bearer token required.
    """
    return convert_lead_to_opportunity(
        db=db,
        lead_id=lead_id,
        opportunity_name=opportunity_name,
        deal_value=deal_value,
        expected_close_date=expected_close_date,
    )
