# ============================================
# SalesFlow CRM - Opportunity Router (API Endpoints)
# ============================================
# This file defines all API endpoints for Opportunity (deal) management.
#
# ENDPOINTS:
# POST   /opportunities                → Create an opportunity
# GET    /opportunities                → List all opportunities (with filters)
# GET    /opportunities/{id}           → Get a single opportunity
# PUT    /opportunities/{id}           → Update an opportunity
# DELETE /opportunities/{id}           → Delete an opportunity
# POST   /opportunities/{id}/approval  → Approve or reject a deal ⭐
#
# ALL ROUTES ARE PROTECTED - User must be logged in (JWT required)

from typing import Optional, List

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from connection.database import get_db
from auth.jwt_handler import get_current_user
from models.user import User
from models.opportunity import OpportunityStage, ApprovalStatus
from schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    ApprovalAction,
    ApprovalResponse,
)
from services.opportunity_service import (
    create_opportunity,
    get_opportunity_by_id,
    update_opportunity,
    delete_opportunity,
    list_opportunities,
    process_approval,
)

# Create router with prefix and tags
router = APIRouter(
    prefix="/opportunities",
    tags=["Opportunities"],
)


# ============================================
# POST /opportunities - Create an opportunity
# ============================================
@router.post(
    "/",
    response_model=OpportunityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an opportunity",
    description="""
    Manually create a new opportunity (deal).
    
    **Approval Logic:**
    - If deal_value > ₹1,00,000 → approval_status = 'Pending'
    - If deal_value ≤ ₹1,00,000 → approval_status = 'Approved'
    
    NOTE: Opportunities are usually created via lead conversion (POST /leads/{id}/convert).
    """
)
def create_new_opportunity(
    opp_data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new opportunity manually.
    
    The opportunity is assigned to the logged-in user.
    A valid lead_id must be provided.
    
    **Authorization:** Bearer token required.
    """
    return create_opportunity(db=db, opp_data=opp_data, owner_id=current_user.id)


# ============================================
# GET /opportunities - List all opportunities
# ============================================
@router.get(
    "/",
    response_model=List[OpportunityResponse],
    summary="List all opportunities",
    description="Get all opportunities with optional filtering by stage and approval status."
)
def get_all_opportunities(
    stage: Optional[OpportunityStage] = Query(
        None, description="Filter by stage: Prospecting, Proposal, Negotiation, Won, Lost"
    ),
    approval_status: Optional[ApprovalStatus] = Query(
        None, description="Filter by approval: Pending, Approved, Rejected"
    ),
    skip: int = Query(0, ge=0, description="Records to skip (pagination)"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all opportunities with optional filtering.
    
    **Query Parameters:**
    - `stage`: Filter by deal stage
    - `approval_status`: Filter by approval status
    - `skip` / `limit`: Pagination controls
    
    **Authorization:** Bearer token required.
    """
    return list_opportunities(
        db=db,
        stage_filter=stage,
        approval_filter=approval_status,
        skip=skip,
        limit=limit,
    )


# ============================================
# GET /opportunities/{id} - Get single opportunity
# ============================================
@router.get(
    "/{opp_id}",
    response_model=OpportunityResponse,
    summary="Get an opportunity by ID",
    description="Fetch a single opportunity's details by its ID."
)
def get_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single opportunity by ID.
    
    **Authorization:** Bearer token required.
    """
    return get_opportunity_by_id(db=db, opp_id=opp_id)


# ============================================
# PUT /opportunities/{id} - Update opportunity
# ============================================
@router.put(
    "/{opp_id}",
    response_model=OpportunityResponse,
    summary="Update an opportunity",
    description="""
    Update an existing opportunity's details.
    Only send the fields you want to change.
    
    **Note:** If deal_value is updated to > ₹1,00,000, 
    the approval_status is automatically reset to 'Pending'.
    """
)
def update_existing_opportunity(
    opp_id: int,
    opp_data: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an opportunity (partial update).
    
    **Important:** To change approval_status, use the 
    `/opportunities/{id}/approval` endpoint instead.
    
    **Authorization:** Bearer token required.
    """
    return update_opportunity(db=db, opp_id=opp_id, opp_data=opp_data)


# ============================================
# DELETE /opportunities/{id} - Delete opportunity
# ============================================
@router.delete(
    "/{opp_id}",
    summary="Delete an opportunity",
    description="Permanently remove an opportunity from the system."
)
def delete_existing_opportunity(
    opp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete an opportunity by ID.
    
    **Warning:** This action is permanent and cannot be undone.
    
    **Authorization:** Bearer token required.
    """
    return delete_opportunity(db=db, opp_id=opp_id)


# ============================================
# POST /opportunities/{id}/approval - Approve/Reject ⭐
# ============================================
@router.post(
    "/{opp_id}/approval",
    response_model=ApprovalResponse,
    summary="Approve or reject an opportunity",
    description="""
    ⭐ **Manager Approval Workflow**
    
    Approve or reject a high-value deal (> ₹1,00,000).
    
    **Business Rules:**
    - Only opportunities with 'Pending' status can be processed
    - Action must be either 'Approved' or 'Rejected'
    - Optional reason can be provided for audit trail
    """
)
def approve_or_reject_opportunity(
    opp_id: int,
    approval_data: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ⭐ Approve or reject a pending opportunity.
    
    **Flow:**
    ```
    Opportunity (Pending) → Manager Review
                          → Approved ✅ or Rejected ❌
    ```
    
    **Request Body:**
    - `action`: "Approved" or "Rejected"
    - `reason`: (optional) Reason for the decision
    
    **Authorization:** Bearer token required.
    """
    return process_approval(db=db, opp_id=opp_id, approval_data=approval_data)
