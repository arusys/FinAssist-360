from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.all_schemas import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.audit_log import AuditLog

class AuthService:
    @staticmethod
    def register_user(db: Session, req: UserRegister) -> User:
        existing_email = db.query(User).filter(User.email == req.email).first()
        if existing_email:
            raise ValueError("A user with this email address already exists.")
        
        existing_user = db.query(User).filter(User.username == req.username).first()
        if existing_user:
            raise ValueError("A user with this username already exists.")

        try:
            role_enum = UserRole(req.role)
        except ValueError:
            role_enum = UserRole.SERVICE_DESK_AGENT

        new_user = User(
            email=req.email,
            username=req.username,
            full_name=req.full_name,
            hashed_password=get_password_hash(req.password),
            role=role_enum,
            department=req.department
        )
        db.add(new_user)
        db.flush()

        audit = AuditLog(
            user_id=new_user.id,
            username=new_user.username,
            user_role=new_user.role.value,
            action="USER_REGISTERED",
            entity_type="User",
            entity_id=str(new_user.id),
            details=f"User {new_user.username} registered with role {new_user.role.value}"
        )
        db.add(audit)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> Optional[User]:
        user = db.query(User).filter(User.username == login_data.username).first()
        if not user or not verify_password(login_data.password, user.hashed_password):
            return None

        if not user.is_active:
            raise ValueError("ACCOUNT_DEACTIVATED")
        
        # Log successful login
        audit = AuditLog(
            user_id=user.id,
            username=user.username,
            user_role=user.role.value,
            action="USER_LOGIN",
            entity_type="User",
            entity_id=str(user.id),
            details="User logged in successfully"
        )
        db.add(audit)
        db.commit()
        return user
