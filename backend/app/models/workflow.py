from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    stages_json = Column(Text, nullable=False)  # JSON array of stage names/configs
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_definitions.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # "Incident", "ServiceRequest"
    entity_id = Column(Integer, nullable=False)
    entity_ref = Column(String(100), nullable=False)  # INC-2025-001 or REQ-2025-001
    current_stage = Column(String(100), nullable=False)
    status = Column(String(50), default="IN_PROGRESS")  # IN_PROGRESS, WAITING_APPROVAL, COMPLETED, FAILED
    started_by = Column(String(100), default="AI Orchestrator")
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    workflow = relationship("WorkflowDefinition")
    tasks = relationship("WorkflowTask", back_populates="execution", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="execution", cascade="all, delete-orphan")

class WorkflowTask(Base):
    __tablename__ = "workflow_tasks"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    stage_name = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED
    assigned_role = Column(String(100), nullable=True)
    assigned_user = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    execution = relationship("WorkflowExecution", back_populates="tasks")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=True)
    entity_type = Column(String(50), nullable=False)  # "Incident", "ServiceRequest", "TransactionReversal"
    entity_id = Column(Integer, nullable=False)
    entity_ref = Column(String(100), nullable=False)
    action_requested = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_role = Column(String(100), default="Service Manager")
    status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED
    approver_name = Column(String(100), nullable=True)
    decision_reason = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    execution = relationship("WorkflowExecution", back_populates="approvals")
