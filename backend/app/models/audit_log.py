from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(100), default="system")
    user_role = Column(String(100), default="System")
    action = Column(String(100), nullable=False)  # USER_LOGIN, INCIDENT_CREATE, APPROVAL_GRANTED, etc.
    entity_type = Column(String(50), nullable=True)  # Incident, ServiceRequest, Workflow, etc.
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
