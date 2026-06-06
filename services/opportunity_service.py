# ============================================
# SalesFlow CRM - Opportunity Service (Business Logic)
# ============================================
# This file contains ALL business logic for Opportunity operations.
#
# WHAT THIS FILE DOES:
# 1. Create Opportunity  → Add a new deal manually
# 2. Update Opportunity  → Modify deal details or stage
# 3. Delete Opportunity  → Remove a deal
# 4. List Opportunities  → Get all deals with optional filters
# 5. Approve/Reject Deal → Manager approval workflow
#
# APPROVAL WORKFLOW (Interview-Ready Explanation):
# ────────────────────────────────────────────────
# When deal_value > ₹1,00,000:
#   → approval_status = "Pending" (auto-set on creation)
#   → Manager reviews the deal
#   → Manager calls /approve endpoint with "Approved" or "Rejected"
#   → If Approved → Deal proceeds normally
#   → If Rejected → Deal is flagged, team is notified

from typing import Optional, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.opportunity import Opportunity, OpportunityStage, ApprovalStatus
from models.lead import Lead
from schemas.opportunity import OpportunityCreate, OpportunityUpdate, ApprovalAction


# --- Approval threshold constant ---
APPROVAL_THRESHOLD = 100000.0


def create_opportunity(
    db: Session,
    opp_data: OpportunityCreate,
    owner_id: int,
) -> Opportunity:
    """
    Create a new opportunity (deal) manually.
    
    NOTE: Opportunities are usually created via lead conversion,
    but this allows manual creation for flexibility.
    
    APPROVAL LOGIC:
    - deal_value > 100,000 → approval_status = "Pending"
    - deal_value <= 100,000 → approval_status = "Approved"
    
    Args:
        db: Database session
        opp_data: Validated opportunity data
        owner_id: ID of the logged-in user
        
    Returns:
        The newly created Opportunity
    """
    # Verify that the referenced lead exists
    lead = db.query(Lead).filter(Lead.id == opp_data.lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {opp_data.lead_id} not found"
        )

    # Determine approval status based on deal value
    if opp_data.deal_value > APPROVAL_THRESHOLD:
        approval = ApprovalStatus.PENDING
    else:
        approval = ApprovalStatus.APPROVED

    # Create the opportunity
    new_opportunity = Opportunity(
        opportunity_name=opp_data.opportunity_name,
        lead_id=opp_data.lead_id,
        owner_id=owner_id,
        deal_value=opp_data.deal_value,
        stage=opp_data.stage or OpportunityStage.PROSPECTING,
        expected_close_date=opp_data.expected_close_date,
        approval_status=approval,
    )

    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)

    return new_opportunity


def get_opportunity_by_id(db: Session, opp_id: int) -> Opportunity:
    """
    Fetch a single opportunity by its ID.
    
    Args:
        db: Database session
        opp_id: The opportunity's ID
        
    Returns:
        The Opportunity object
        
    Raises:
        HTTPException 404: If opportunity not found
    """
    opportunity = db.query(Opportunity).filter(Opportunity.id == opp_id).first()

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opportunity with id {opp_id} not found"
        )

    return opportunity


def update_opportunity(
    db: Session,
    opp_id: int,
    opp_data: OpportunityUpdate,
) -> Opportunity:
    """
    Update an existing opportunity's details.
    
    Only updates fields that are provided (partial update).
    
    IMPORTANT: If deal_value is updated to > 100,000 and was previously
    auto-approved, the approval_status is reset to "Pending".
    
    Args:
        db: Database session
        opp_id: ID of the opportunity to update
        opp_data: Fields to update
        
    Returns:
        The updated Opportunity
    """
    opportunity = get_opportunity_by_id(db, opp_id)

    update_data = opp_data.model_dump(exclude_unset=True)

    # Apply updates
    for field, value in update_data.items():
        setattr(opportunity, field, value)

    # Re-check approval if deal value changed
    # If the new deal value exceeds threshold, reset to Pending
    if "deal_value" in update_data and update_data["deal_value"] > APPROVAL_THRESHOLD:
        opportunity.approval_status = ApprovalStatus.PENDING

    db.commit()
    db.refresh(opportunity)

    return opportunity


def delete_opportunity(db: Session, opp_id: int) -> dict:
    """
    Delete an opportunity from the database.
    
    Args:
        db: Database session
        opp_id: ID of the opportunity to delete
        
    Returns:
        Success message
    """
    opportunity = get_opportunity_by_id(db, opp_id)

    db.delete(opportunity)
    db.commit()

    return {
        "message": f"Opportunity '{opportunity.opportunity_name}' (id: {opp_id}) deleted successfully"
    }


def list_opportunities(
    db: Session,
    stage_filter: Optional[OpportunityStage] = None,
    approval_filter: Optional[ApprovalStatus] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Opportunity]:
    """
    List all opportunities with optional filtering and pagination.
    
    Args:
        db: Database session
        stage_filter: Filter by deal stage (Prospecting, Proposal, etc.)
        approval_filter: Filter by approval status (Pending, Approved, Rejected)
        skip: Records to skip (pagination)
        limit: Max records to return
        
    Returns:
        List of Opportunity objects
    """
    query = db.query(Opportunity)

    if stage_filter:
        query = query.filter(Opportunity.stage == stage_filter)

    if approval_filter:
        query = query.filter(Opportunity.approval_status == approval_filter)

    return query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()


def process_approval(
    db: Session,
    opp_id: int,
    approval_data: ApprovalAction,
) -> dict:
    """
    ⭐ APPROVAL WORKFLOW - Manager Approval/Rejection
    
    This is the approval flow for high-value deals (> ₹1,00,000).
    
    BUSINESS RULES:
    ───────────────
    1. Only deals with "Pending" approval can be processed
    2. Manager can either "Approve" or "Reject"
    3. If "Approved" → Deal proceeds, sales rep can continue
    4. If "Rejected" → Deal is flagged, needs rework
    
    FLOW:
    Opportunity (Pending) → Manager Reviews
                          → Approve → Status = "Approved" ✅
                          → Reject  → Status = "Rejected" ❌
    
    Args:
        db: Database session
        opp_id: ID of the opportunity to approve/reject
        approval_data: Contains the action (Approved/Rejected) and reason
        
    Returns:
        Dictionary with approval details
        
    Raises:
        HTTPException 400: If opportunity is not in "Pending" status
    """
    opportunity = get_opportunity_by_id(db, opp_id)

    # Validate: Only "Pending" deals can be approved or rejected
    if opportunity.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This opportunity is already '{opportunity.approval_status}'. "
                   f"Only 'Pending' opportunities can be approved or rejected."
        )

    # Validate: Can't set to "Pending" again
    if approval_data.action == ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot set approval status to 'Pending'. Use 'Approved' or 'Rejected'."
        )

    # Update the approval status
    opportunity.approval_status = approval_data.action

    db.commit()
    db.refresh(opportunity)

    # Build response message
    action_word = "approved" if approval_data.action == ApprovalStatus.APPROVED else "rejected"

    return {
        "message": f"Opportunity '{opportunity.opportunity_name}' has been {action_word}",
        "opportunity_id": opportunity.id,
        "opportunity_name": opportunity.opportunity_name,
        "deal_value": opportunity.deal_value,
        "approval_status": str(opportunity.approval_status),
        "reason": approval_data.reason,
    }
