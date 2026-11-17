from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_query = Column(Text, nullable=False)
    status = Column(String(50), default="COMPLETED")  # RUNNING, COMPLETED, FAILED
    total_agents_involved = Column(Integer, default=0)
    total_execution_time_ms = Column(Float, default=0.0)
    final_response = Column(Text, nullable=True)
    created_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    steps = relationship("AgentStep", back_populates="execution", cascade="all, delete-orphan", order_by="AgentStep.step_order")

class AgentStep(Base):
    __tablename__ = "agent_steps"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    agent_name = Column(String(100), nullable=False)
    agent_role = Column(String(150), nullable=False)
    status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED, SKIPPED
    input_summary = Column(Text, nullable=True)
    output_data_json = Column(Text, nullable=False)  # JSON formatted agent result
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    execution = relationship("AgentExecution", back_populates="steps")
