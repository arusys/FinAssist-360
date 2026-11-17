import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class IncidentPriority(str, enum.Enum):
    P1 = "P1 – Critical"
    P2 = "P2 – High"
    P3 = "P3 – Medium"
    P4 = "P4 – Low"

class IncidentStatus(str, enum.Enum):
    NEW = "New"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    PENDING = "Pending"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class IncidentCategory(str, enum.Enum):
    PAYMENT_FAILURE = "Payment Failure"
    ATM_FAILURE = "ATM Failure"
    CARD_ISSUES = "Card Issues"
    MOBILE_BANKING = "Mobile Banking"
    INTERNET_BANKING = "Internet Banking"
    ACCOUNT_ACCESS = "Account Access"
    TRANSACTION_DISPUTES = "Transaction Disputes"
    BANKING_INFRASTRUCTURE = "Banking Infrastructure"
    SECURITY_ALERTS = "Security Alerts"
    LOGIN_PROBLEM = "Login Problem"
    FAILED_TRANSACTION = "Failed Transaction"
    DUPLICATE_TRANSACTION = "Duplicate Transaction"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(IncidentCategory), nullable=False)
    priority = Column(Enum(IncidentPriority), default=IncidentPriority.P3, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.NEW, nullable=False)
    
    # Banking Service linkage
    service_id = Column(Integer, ForeignKey("banking_services.id"), nullable=True)
    service = relationship("BankingService", back_populates="incidents")

    # Assignment
    assigned_department = Column(String(100), default="General Support")
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    
    reported_by = Column(String(150), default="Customer Care Portal")
    customer_identifier = Column(String(100), nullable=True)  # masked user or phone
    
    # Root cause & AI Analysis
    ai_generated = Column(Boolean, default=False)
    ai_confidence = Column(String(50), nullable=True)
    root_cause = Column(Text, nullable=True)
    investigation_summary = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # SLA & Timestamps
    sla_due_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Notes & History
    notes = relationship("IncidentNote", back_populates="incident", cascade="all, delete-orphan")
    history = relationship("IncidentHistory", back_populates="incident", cascade="all, delete-orphan")
    predictions = relationship("IncidentPrediction", back_populates="incident", cascade="all, delete-orphan")

class IncidentNote(Base):
    __tablename__ = "incident_notes"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    author_name = Column(String(100), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="notes")

class IncidentHistory(Base):
    __tablename__ = "incident_histories"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    changed_by = Column(String(100), nullable=False)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="history")
