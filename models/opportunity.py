# ============================================
# SalesFlow CRM - Opportunity Model
# ============================================
# This file defines the Opportunity table in the database.
# An Opportunity represents an active deal in progress.
#
# HOW OPPORTUNITIES ARE CREATED:
# 1. A Lead gets qualified by a sales rep
# 2. The lead is "converted" into an Opportunity
# 3. The Opportunity tracks the deal through stages
#
# APPROVAL WORKFLOW:
# If deal_value > ₹1,00,000 (1 Lakh):
#   → approval_status is automatically set to "Pending"
#   → A manager must Approve or Reject the deal
# If deal_value <= ₹1,00,000:
#   → approval_status is set to "Approved" automatically

import enum

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from connection.database import Base

# Import models for relationship resolution
from models.user import User  # noqa: F401


class OpportunityStage(str, enum.Enum):
    """
    Stages of a deal/opportunity.
    
    Flow: Prospecting → Proposal → Negotiation → Won / Lost
    
    - PROSPECTING: Initial research and outreach
    - PROPOSAL: Formal proposal/quote has been sent
    - NEGOTIATION: Terms are being discussed
    - WON: Deal is closed and won! 🎉
    - LOST: Deal fell through 😞
    """
    PROSPECTING = "Prospecting"
    PROPOSAL = "Proposal"
    NEGOTIATION = "Negotiation"
    WON = "Won"
    LOST = "Lost"


class ApprovalStatus(str, enum.Enum):
    """
    Approval status for high-value deals.
    
    - PENDING: Waiting for manager approval
    - APPROVED: Manager has approved the deal
    - REJECTED: Manager has rejected the deal
    """
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Opportunity(Base):
    """
    Opportunity model - represents the 'opportunities' table in PostgreSQL.
    
    An Opportunity is an active deal that came from a converted Lead.
    It tracks the deal value, stage, and approval status.
    
    Table Structure:
    ┌──────────────────┬──────────────┬──────────────────────────────────┐
    │ Column           │ Type         │ Description                      │
    ├──────────────────┼──────────────┼──────────────────────────────────┤
    │ id               │ INTEGER      │ Primary key, auto-increment      │
    │ opportunity_name │ VARCHAR(200) │ Name/title of the deal           │
    │ lead_id          │ INTEGER      │ FK → leads.id (source lead)      │
    │ owner_id         │ INTEGER      │ FK → users.id (deal owner)       │
    │ deal_value       │ FLOAT        │ Monetary value of the deal       │
    │ stage            │ ENUM         │ Current deal stage               │
    │ expected_close   │ DATE         │ When we expect to close the deal │
    │ approval_status  │ ENUM         │ Pending / Approved / Rejected    │
    │ created_at       │ TIMESTAMP    │ When the opportunity was created │
    └──────────────────┴──────────────┴──────────────────────────────────┘
    """

    __tablename__ = "opportunities"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # --- Opportunity Information ---
    # Name of the deal (e.g., "Acme Corp - Enterprise Plan")
    opportunity_name = Column(String(200), nullable=False)

    # Which lead was converted to create this opportunity?
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)

    # Which sales rep owns this deal?
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # How much is this deal worth?
    deal_value = Column(Float, nullable=False, default=0.0)

    # What stage is the deal in?
    # Using String instead of Enum for SQLite compatibility
    stage = Column(
        String(20),
        default=OpportunityStage.PROSPECTING.value,
        nullable=False
    )

    # When do we expect to close this deal?
    expected_close_date = Column(Date, nullable=True)

    # Does this deal need manager approval?
    # Automatically set to "Pending" if deal_value > 100,000
    # Using String instead of Enum for SQLite compatibility
    approval_status = Column(
        String(20),
        default=ApprovalStatus.APPROVED.value,
        nullable=False
    )

    # When was this opportunity created?
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- Relationships ---
    # Access the source lead: opportunity.lead
    lead = relationship("Lead", back_populates="opportunities")

    # Access the deal owner: opportunity.owner
    owner = relationship("User", backref="opportunities")

    def __repr__(self):
        return f"<Opportunity(id={self.id}, name='{self.opportunity_name}', stage='{self.stage}')>"
