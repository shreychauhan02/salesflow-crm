# ============================================
# SalesFlow CRM - Lead Service (Business Logic)
# ============================================
# This file contains ALL the business logic for Lead operations.
#
# WHAT THIS FILE DOES:
# 1. Create Lead    → Add a new potential customer
# 2. Update Lead    → Modify lead information or status
# 3. Delete Lead    → Remove a lead from the system
# 4. Get Lead       → Fetch a single lead by ID
# 5. List Leads     → Get all leads with optional filters
# 6. Search Leads   → Find leads by name/email/company
# 7. Convert Lead   → Transform a qualified lead into an Opportunity
#
# LEAD CONVERSION LOGIC (Interview-Ready Explanation):
# ─────────────────────────────────────────────────────
# Step 1: Check if lead exists and is "Qualified"
# Step 2: Create a new Opportunity from the lead data
# Step 3: If deal_value > 100,000 → set approval_status = "Pending"
# Step 4: Update lead status to "Converted"
# Step 5: Return both the lead and opportunity info

from typing import Optional, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.lead import Lead, LeadStatus
from models.opportunity import Opportunity, OpportunityStage, ApprovalStatus
from schemas.lead import LeadCreate, LeadUpdate


# --- Approval threshold constant ---
# Deals above this value require manager approval
APPROVAL_THRESHOLD = 100000.0


def create_lead(db: Session, lead_data: LeadCreate, owner_id: int) -> Lead:
    """
    Create a new lead in the database.
    
    Args:
        db: Database session
        lead_data: Validated lead data from the request
        owner_id: ID of the logged-in user (lead owner/sales rep)
        
    Returns:
        The newly created Lead object
    """
    # Create new Lead object from the request data
    new_lead = Lead(
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        company=lead_data.company,
        source=lead_data.source,
        status=LeadStatus.NEW,   # All new leads start as "New"
        owner_id=owner_id,       # Assign to the current user
    )

    # Save to database
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    return new_lead


def get_lead_by_id(db: Session, lead_id: int) -> Lead:
    """
    Fetch a single lead by its ID.
    
    Args:
        db: Database session
        lead_id: The lead's ID
        
    Returns:
        The Lead object
        
    Raises:
        HTTPException 404: If lead is not found
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found"
        )

    return lead


def update_lead(db: Session, lead_id: int, lead_data: LeadUpdate) -> Lead:
    """
    Update an existing lead's information.
    
    Only updates the fields that are provided (not None).
    This is called "partial update" or "PATCH-style update".
    
    Args:
        db: Database session
        lead_id: ID of the lead to update
        lead_data: Fields to update (only non-None values are applied)
        
    Returns:
        The updated Lead object
    """
    # First, find the lead
    lead = get_lead_by_id(db, lead_id)

    # Get only the fields that were actually sent in the request
    # exclude_unset=True ignores fields the client didn't provide
    update_data = lead_data.model_dump(exclude_unset=True)

    # Apply each update to the lead object
    for field, value in update_data.items():
        setattr(lead, field, value)  # Same as: lead.name = value, lead.email = value, etc.

    # Save changes
    db.commit()
    db.refresh(lead)

    return lead


def delete_lead(db: Session, lead_id: int) -> dict:
    """
    Delete a lead from the database.
    
    Args:
        db: Database session
        lead_id: ID of the lead to delete
        
    Returns:
        Success message
        
    Raises:
        HTTPException 404: If lead not found
    """
    lead = get_lead_by_id(db, lead_id)

    db.delete(lead)
    db.commit()

    return {"message": f"Lead '{lead.name}' (id: {lead_id}) deleted successfully"}


def list_leads(
    db: Session,
    status_filter: Optional[LeadStatus] = None,
    source_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Lead]:
    """
    List all leads with optional filtering and pagination.
    
    Args:
        db: Database session
        status_filter: Filter by lead status (New, Contacted, etc.)
        source_filter: Filter by lead source (Website, Referral, etc.)
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of Lead objects matching the filters
        
    Example:
        # Get all "Qualified" leads
        leads = list_leads(db, status_filter=LeadStatus.QUALIFIED)
        
        # Get leads from "Website" source, page 2 (skip first 100)
        leads = list_leads(db, source_filter="Website", skip=100, limit=100)
    """
    # Start building the query
    query = db.query(Lead)

    # Apply filters if provided
    if status_filter:
        query = query.filter(Lead.status == status_filter)

    if source_filter:
        query = query.filter(Lead.source.ilike(f"%{source_filter}%"))

    # Apply pagination and return results
    # Order by newest first (most recent leads at the top)
    return query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()


def search_leads(
    db: Session,
    name: Optional[str] = None,
    email: Optional[str] = None,
    company: Optional[str] = None,
    status_filter: Optional[LeadStatus] = None,
    source: Optional[str] = None,
) -> List[Lead]:
    """
    Search leads by multiple criteria (partial matching).
    
    Uses SQL 'ILIKE' for case-insensitive partial matching.
    For example, searching "rah" will match "Rahul", "rahul", "RAHUL".
    
    Args:
        db: Database session
        name: Search by name (partial match)
        email: Search by email (partial match)
        company: Search by company (partial match)
        status_filter: Exact match on status
        source: Search by source (partial match)
        
    Returns:
        List of matching Lead objects
    """
    query = db.query(Lead)

    # Apply search filters (ILIKE = case-insensitive LIKE)
    if name:
        query = query.filter(Lead.name.ilike(f"%{name}%"))
    if email:
        query = query.filter(Lead.email.ilike(f"%{email}%"))
    if company:
        query = query.filter(Lead.company.ilike(f"%{company}%"))
    if status_filter:
        query = query.filter(Lead.status == status_filter)
    if source:
        query = query.filter(Lead.source.ilike(f"%{source}%"))

    return query.order_by(Lead.created_at.desc()).all()


def convert_lead_to_opportunity(
    db: Session,
    lead_id: int,
    opportunity_name: str,
    deal_value: float,
    expected_close_date=None,
) -> dict:
    """
    ⭐ LEAD CONVERSION - Core Business Logic (Interview-Ready!)
    
    This is the most important business flow in a CRM:
    Converting a Lead into an Opportunity (a real deal).
    
    BUSINESS RULES:
    ───────────────
    1. Only "Qualified" leads can be converted
    2. A new Opportunity is created from the lead's data
    3. If deal_value > ₹1,00,000 → approval_status = "Pending"
       (Manager must approve high-value deals)
    4. If deal_value <= ₹1,00,000 → approval_status = "Approved"
       (Low-value deals are auto-approved)
    5. Lead status changes from "Qualified" → "Converted"
    
    FLOW DIAGRAM:
    Lead (Qualified) → Convert → Opportunity (Prospecting)
                                 └─ deal > 1L? → Pending Approval
                                 └─ deal ≤ 1L? → Auto Approved
    
    Args:
        db: Database session
        lead_id: ID of the lead to convert
        opportunity_name: Name for the new opportunity
        deal_value: Value of the deal
        expected_close_date: When we expect to close the deal
        
    Returns:
        Dictionary with conversion details
        
    Raises:
        HTTPException 400: If lead is not in "Qualified" status
        HTTPException 400: If lead is already converted
    """
    # Step 1: Find the lead
    lead = get_lead_by_id(db, lead_id)

    # Step 2: Validate lead status
    # Only "Qualified" leads can be converted
    if lead.status == LeadStatus.CONVERTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This lead has already been converted to an opportunity"
        )

    if lead.status != LeadStatus.QUALIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only 'Qualified' leads can be converted. Current status: '{lead.status.value}'"
        )

    # Step 3: Determine approval status based on deal value
    # HIGH-VALUE DEAL CHECK: Does this deal need manager approval?
    if deal_value > APPROVAL_THRESHOLD:
        # Deal is worth more than ₹1,00,000 → Needs manager approval
        approval = ApprovalStatus.PENDING
    else:
        # Deal is ₹1,00,000 or less → Auto-approved
        approval = ApprovalStatus.APPROVED

    # Step 4: Create the Opportunity
    new_opportunity = Opportunity(
        opportunity_name=opportunity_name,
        lead_id=lead.id,
        owner_id=lead.owner_id,       # Same owner as the lead
        deal_value=deal_value,
        stage=OpportunityStage.PROSPECTING,  # Starts at first stage
        expected_close_date=expected_close_date,
        approval_status=approval,
    )

    # Step 5: Update lead status to "Converted"
    lead.status = LeadStatus.CONVERTED

    # Step 6: Save everything to the database
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)
    db.refresh(lead)

    # Step 7: Return conversion summary
    return {
        "message": "Lead successfully converted to opportunity!",
        "lead_id": lead.id,
        "lead_status": lead.status.value,
        "opportunity_id": new_opportunity.id,
        "opportunity_name": new_opportunity.opportunity_name,
        "deal_value": new_opportunity.deal_value,
        "approval_status": new_opportunity.approval_status.value,
    }
