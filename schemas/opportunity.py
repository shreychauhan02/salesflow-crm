# ============================================
# SalesFlow CRM - Opportunity Schemas (Pydantic)
# ============================================
# Request/Response schemas for the Opportunity module.
#
# These schemas handle validation for deal management,
# including the approval workflow for high-value deals.

from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, Field

from models.opportunity import OpportunityStage, ApprovalStatus


# ============================================
# REQUEST SCHEMAS (data coming IN)
# ============================================

class OpportunityCreate(BaseModel):
    """
    Schema for manually creating an opportunity (POST /opportunities).
    
    NOTE: Opportunities are usually created automatically when
    a lead is converted, but this allows manual creation too.
    
    APPROVAL LOGIC:
    - If deal_value > 100,000 → approval_status = "Pending"
    - If deal_value <= 100,000 → approval_status = "Approved"
    """
    opportunity_name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        example="Acme Corp - Enterprise Plan",
        description="Name/title of the deal"
    )
    lead_id: int = Field(
        ...,
        example=1,
        description="ID of the lead this opportunity came from"
    )
    deal_value: float = Field(
        ...,
        ge=0,  # Must be >= 0
        example=50000.00,
        description="Monetary value of the deal"
    )
    stage: Optional[OpportunityStage] = Field(
        OpportunityStage.PROSPECTING,
        description="Current deal stage: Prospecting, Proposal, Negotiation, Won, Lost"
    )
    expected_close_date: Optional[date] = Field(
        None,
        example="2026-08-15",
        description="Expected date to close the deal"
    )


class OpportunityUpdate(BaseModel):
    """
    Schema for updating an existing opportunity (PUT /opportunities/{id}).
    
    All fields are optional - only send what you want to change.
    NOTE: approval_status cannot be changed here.
    Use the dedicated /opportunities/{id}/approve or /reject endpoints.
    """
    opportunity_name: Optional[str] = Field(None, min_length=2, max_length=200)
    deal_value: Optional[float] = Field(None, ge=0)
    stage: Optional[OpportunityStage] = None
    expected_close_date: Optional[date] = None


class ApprovalAction(BaseModel):
    """
    Schema for manager approval/rejection (POST /opportunities/{id}/approve).
    
    The manager provides:
    - action: "Approved" or "Rejected"
    - reason: (optional) Why the decision was made
    """
    action: ApprovalStatus = Field(
        ...,
        description="Approval decision: 'Approved' or 'Rejected'"
    )
    reason: Optional[str] = Field(
        None,
        max_length=500,
        example="Deal value is reasonable for the client size",
        description="Reason for the approval/rejection decision"
    )


# ============================================
# RESPONSE SCHEMAS (data going OUT)
# ============================================

class OpportunityResponse(BaseModel):
    """
    Schema for opportunity data in API responses.
    
    Includes all deal details, stage, and approval status.
    """
    id: int
    opportunity_name: str
    lead_id: int
    owner_id: int
    deal_value: float
    stage: OpportunityStage
    expected_close_date: Optional[date] = None
    approval_status: ApprovalStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalResponse(BaseModel):
    """
    Response after a manager approves or rejects a deal.
    """
    message: str
    opportunity_id: int
    opportunity_name: str
    deal_value: float
    approval_status: str
    reason: Optional[str] = None
