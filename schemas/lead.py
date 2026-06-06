# ============================================
# SalesFlow CRM - Lead Schemas (Pydantic)
# ============================================
# Request/Response schemas for the Lead module.
#
# These schemas validate data coming in from the client
# and control what data goes out in API responses.

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from models.lead import LeadStatus


# ============================================
# REQUEST SCHEMAS (data coming IN)
# ============================================

class LeadCreate(BaseModel):
    """
    Schema for creating a new lead (POST /leads).
    
    Required: name, email
    Optional: phone, company, source
    """
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        example="Rahul Sharma",
        description="Lead's full name"
    )
    email: EmailStr = Field(
        ...,
        example="rahul@acmecorp.com",
        description="Lead's email address"
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        example="+91-9876543210",
        description="Lead's phone number"
    )
    company: Optional[str] = Field(
        None,
        max_length=150,
        example="Acme Corporation",
        description="Company the lead works for"
    )
    source: Optional[str] = Field(
        None,
        max_length=100,
        example="Website",
        description="How was this lead acquired? (Website, Referral, LinkedIn, etc.)"
    )


class LeadUpdate(BaseModel):
    """
    Schema for updating an existing lead (PUT /leads/{id}).
    
    All fields are optional - only send what you want to change.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=150)
    source: Optional[str] = Field(None, max_length=100)
    status: Optional[LeadStatus] = Field(
        None,
        description="Update lead status: New, Contacted, Qualified, Lost, Converted"
    )


class LeadSearch(BaseModel):
    """
    Schema for searching/filtering leads (GET /leads).
    
    All fields are optional query parameters.
    Pass any combination to filter results.
    """
    name: Optional[str] = Field(None, description="Search by name (partial match)")
    email: Optional[str] = Field(None, description="Search by email (partial match)")
    company: Optional[str] = Field(None, description="Filter by company (partial match)")
    status: Optional[LeadStatus] = Field(None, description="Filter by status")
    source: Optional[str] = Field(None, description="Filter by source")


# ============================================
# RESPONSE SCHEMAS (data going OUT)
# ============================================

class LeadResponse(BaseModel):
    """
    Schema for lead data in API responses.
    
    Returns all lead information including status and timestamps.
    """
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: LeadStatus
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LeadConvertResponse(BaseModel):
    """
    Response when a lead is successfully converted to an opportunity.
    
    Returns both the updated lead and the newly created opportunity info.
    """
    message: str
    lead_id: int
    lead_status: str
    opportunity_id: int
    opportunity_name: str
    deal_value: float
    approval_status: str

    class Config:
        from_attributes = True
