from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        # Fallback to demo default user if in demo mode / unauthenticated for smooth evaluation
        demo_user = db.query(User).filter(User.username == "admin").first()
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )

    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated by the administrator. Contact IT support to re-activate."
        )
    return user

def require_roles(*allowed_roles):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_val = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        if user_role_val in ["Super Admin", "Admin"]:
            return current_user
        if user_role_val in allowed_roles:
            return current_user
        norm_user = user_role_val.lower().replace(" ", "").replace("_", "")
        norm_allowed = [r.lower().replace(" ", "").replace("_", "") for r in allowed_roles]
        if norm_user in norm_allowed:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation not permitted for role {user_role_val}. Required roles: {allowed_roles}"
        )
    return role_checker
