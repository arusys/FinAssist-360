import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class RequestStatus(str, enum.Enum):
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    IN_PROGRESS = "In Progress"
    FULFILLED = "Fulfilled"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"

class RequestCategory(str, enum.Enum):
    EMPLOYEE_ACCESS = "Employee Access Request"
    BANKING_APP_ACCESS = "Banking Application Access"
    SOFTWARE_INSTALLATION = "Software Installation"
    PASSWORD_RESET = "Password Reset Request"
    HARDWARE_SUPPORT = "Hardware Support Request"
    ONBOARDING = "New Employee Onboarding"
    DEPARTMENTAL_SERVICE = "Departmental Service Request"
    CARD_SUPPORT = "Card Support"
    ACCOUNT_ACCESS_ASSISTANCE = "Account Access Assistance"
    MOBILE_BANKING_SUPPORT = "Mobile Banking Support"
    INTERNET_BANKING_SUPPORT = "Internet Banking Support"

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(RequestCategory), nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(Enum(RequestStatus), default=RequestStatus.SUBMITTED, nullable=False)
    
    requester_name = Column(String(150), nullable=False)
    requester_email = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    
    requires_approval = Column(Boolean, default=True)
    approved_by = Column(String(150), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    fulfillment_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
