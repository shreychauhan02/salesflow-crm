# ============================================
# SalesFlow CRM - Lead Model
# ============================================
# This file defines the Lead table in the database.
# A Lead represents a potential customer who has shown
# interest in your product or service.
#
# LEAD LIFECYCLE:
# New → Contacted → Qualified → Converted (becomes Opportunity)
#                             → Lost (deal didn't work out)

import enum

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from connection.database import Base

# Import models for relationship resolution
from models.user import User  # noqa: F401


class LeadStatus(str, enum.Enum):
    """
    Possible statuses for a Lead.
    
    Flow: New → Contacted → Qualified → Converted / Lost
    
    - NEW: Just entered the system, no contact made yet
    - CONTACTED: Sales rep has reached out to the lead
    - QUALIFIED: Lead is a genuine potential customer
    - LOST: Lead is not interested or not a good fit
    - CONVERTED: Lead became an Opportunity (deal in progress)
    """
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    LOST = "Lost"
    CONVERTED = "Converted"


class Lead(Base):
    """
    Lead model - represents the 'leads' table in PostgreSQL.
    
    A Lead is someone who MIGHT become a customer.
    Once qualified and converted, they become an Opportunity.
    
    Table Structure:
    ┌──────────────┬──────────────┬─────────────────────────────────┐
    │ Column       │ Type         │ Description                     │
    ├──────────────┼──────────────┼─────────────────────────────────┤
    │ id           │ INTEGER      │ Primary key, auto-increment     │
    │ name         │ VARCHAR(100) │ Lead's full name                │
    │ email        │ VARCHAR(255) │ Lead's email address            │
    │ phone        │ VARCHAR(20)  │ Lead's phone number             │
    │ company      │ VARCHAR(150) │ Company the lead works for      │
    │ source       │ VARCHAR(100) │ How we found this lead          │
    │ status       │ ENUM         │ Current status in the pipeline  │
    │ owner_id     │ INTEGER      │ FK → users.id (assigned rep)    │
    │ created_at   │ TIMESTAMP    │ When the lead was created       │
    └──────────────┴──────────────┴─────────────────────────────────┘
    """

    __tablename__ = "leads"

    # --- Primary Key ---
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # --- Lead Information ---
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    company = Column(String(150), nullable=True)

    # Source: Where did this lead come from?
    # Examples: "Website", "Referral", "Cold Call", "LinkedIn", "Trade Show"
    source = Column(String(100), nullable=True)

    # Status: Where is this lead in the sales pipeline?
    # Defaults to "New" when first created
    # Using String instead of Enum for SQLite compatibility
    status = Column(
        String(20),
        default=LeadStatus.NEW.value,
        nullable=False
    )

    # Owner: Which sales rep is responsible for this lead?
    # Foreign key linking to the users table
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Timestamp: When was this lead created?
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # --- Relationships ---
    # This lets us access the owner User object directly: lead.owner
    owner = relationship("User", backref="leads")

    # This lets us access opportunities created from this lead: lead.opportunities
    opportunities = relationship("Opportunity", back_populates="lead")

    def __repr__(self):
        return f"<Lead(id={self.id}, name='{self.name}', status='{self.status}')>"
