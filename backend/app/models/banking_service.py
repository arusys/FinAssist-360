from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class BankingService(Base):
    __tablename__ = "banking_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)  # e.g. "UPI_PAYMENT", "ATM_NETWORK"
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Operational")  # Operational, Degraded, Outage, Maintenance
    availability = Column(Float, default=99.95)  # percentage
    current_incident_count = Column(Integer, default=0)
    affected_requests_count = Column(Integer, default=0)
    sla_threshold = Column(Float, default=99.9)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    incidents = relationship("Incident", back_populates="service")
    dependencies = relationship(
        "ServiceDependency",
        foreign_keys="ServiceDependency.source_service_id",
        back_populates="source_service"
    )
    dependents = relationship(
        "ServiceDependency",
        foreign_keys="ServiceDependency.target_service_id",
        back_populates="target_service"
    )

class ServiceDependency(Base):
    __tablename__ = "service_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    source_service_id = Column(Integer, ForeignKey("banking_services.id"), nullable=False)
    target_service_id = Column(Integer, ForeignKey("banking_services.id"), nullable=False)
    dependency_type = Column(String(50), default="Hard Dependency")  # Hard Dependency, Soft Dependency, Failover
    criticality = Column(String(50), default="High")  # Critical, High, Medium, Low
    description = Column(String(255), nullable=True)

    source_service = relationship("BankingService", foreign_keys=[source_service_id], back_populates="dependencies")
    target_service = relationship("BankingService", foreign_keys=[target_service_id], back_populates="dependents")
