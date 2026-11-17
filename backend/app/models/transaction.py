from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base

class SyntheticTransaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    txn_id = Column(String(50), unique=True, index=True, nullable=False)
    account_mask = Column(String(50), nullable=False)
    service_code = Column(String(50), nullable=False)  # UPI_PAYMENT, ATM_NETWORK, etc.
    merchant_name = Column(String(150), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), nullable=False)  # SUCCESS, FAILED, PENDING_DEBIT, REVERSED, DUPLICATE_SUSPECT
    failure_reason = Column(Text, nullable=True)
    terminal_id = Column(String(50), nullable=True)
    reference_rrn = Column(String(50), index=True, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
