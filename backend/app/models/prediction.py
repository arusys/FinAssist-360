from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class IncidentPrediction(Base):
    __tablename__ = "incident_predictions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("banking_services.id"), nullable=True)
    service_name = Column(String(100), nullable=False)
    recurrence_risk_score = Column(Float, nullable=False)  # 0.0 to 1.0 (e.g. 0.84 = 84% risk)
    risk_level = Column(String(50), nullable=False)  # Critical, High, Medium, Low
    predicted_frequency_days = Column(Float, default=7.0)
    primary_failure_driver = Column(String(200), nullable=True)
    recommended_preventive_actions = Column(Text, nullable=True)  # JSON or bullet text
    confidence_score = Column(Float, default=0.88)
    model_name = Column(String(100), default="RandomForest_BankingFailurePredictor_v1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="predictions")
    service = relationship("BankingService")
