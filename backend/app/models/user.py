import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "Super Admin"
    SERVICE_DESK_AGENT = "Service Desk Agent"
    BANKING_OPERATIONS_MANAGER = "Banking Operations Manager"
    TECHNICAL_SUPPORT_ENGINEER = "Technical Support Engineer"
    OPERATIONS_ANALYST = "Operations Analyst"
    USER = "User"

    # Backward compatibility aliases
    ADMIN = "Super Admin"
    SERVICE_MANAGER = "Banking Operations Manager"
    BANKING_SUPPORT_AGENT = "Service Desk Agent"
    CUSTOMER = "User"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            val_clean = value.lower().replace(" ", "").replace("_", "").replace("-", "")
            if val_clean in ["admin", "superadmin"]:
                return cls.SUPER_ADMIN
            if val_clean in ["servicedeskagent", "bankingsupportagent", "supportagent", "agent"]:
                return cls.SERVICE_DESK_AGENT
            if val_clean in ["bankingoperationsmanager", "servicemanager", "manager", "operationsmanager"]:
                return cls.BANKING_OPERATIONS_MANAGER
            if val_clean in ["technicalsupportengineer", "tech", "techengineer", "engineer"]:
                return cls.TECHNICAL_SUPPORT_ENGINEER
            if val_clean in ["operationsanalyst", "analyst"]:
                return cls.OPERATIONS_ANALYST
            if val_clean in ["user", "customer", "bankingcustomer", "client", "retailcustomer"]:
                return cls.USER
        return None

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.SERVICE_DESK_AGENT, nullable=False)
    department = Column(String(100), nullable=False, default="Retail Banking Operations")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
