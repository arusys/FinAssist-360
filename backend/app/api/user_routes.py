from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user, require_roles
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/users", tags=["User Management & RBAC"])

class UserCreate(BaseModel):
    email: str
    username: str
    full_name: str
    password: str
    role: str = "Service Desk Agent"
    department: str = "Retail Banking Operations"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserResponseSchema(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    department: str
    is_active: bool
    created_at: str

ROLE_PERMISSIONS_MATRIX = [
  {
    "role": "Super Admin",
    "description": "Complete system authority across all modules, configuration, and security controls.",
    "permissions": [
      "Full access to all 12 platform modules",
      "Create, edit, deactivate & manage user accounts",
      "Assign roles & configure granular permissions",
      "Configure AI parameters, model name & security keys",
      "View all incidents, service requests, workflows & audit trails",
      "Perform high-value financial approval overrides (> ₹50,000)"
    ],
    "accessibleModules": [
      "Dashboard", "AI Service Desk", "Incident Management", "Service Requests",
      "AI Agent Center", "Knowledge Base", "Banking Operations", "Predictive Intelligence",
      "Workflow Management", "Analytics & Reports", "Audit Logs", "Settings & User Management"
    ]
  },
  {
    "role": "Service Desk Agent",
    "description": "Customer-facing triage and incident logging specialist.",
    "permissions": [
      "Access AI Service Desk for natural-language complaint intake",
      "Classify complaints into incident categories and P1-P4 priorities",
      "Create, assign and update incidents according to SLA standards",
      "Create and track operational service requests",
      "Access institutional Knowledge Base and AI Agent Center",
      "Draft and send customer resolution updates"
    ],
    "accessibleModules": [
      "Dashboard", "AI Service Desk", "Incident Management", "Service Requests",
      "Knowledge Base", "AI Agent Center"
    ]
  },
  {
    "role": "Banking Operations Manager",
    "description": "Service continuity, incident oversight, and managerial approval gatekeeper.",
    "permissions": [
      "Monitor all 7 core banking services (UPI, ATM, Gateway, etc.)",
      "Supervise critical P1/P2 incidents and enforce SLA targets",
      "Assign and reassign incidents across engineering teams",
      "Review root cause analysis and cross-service dependency blast radius",
      "Approve or reject high-value manual refunds and workflow tasks",
      "Access operational analytics and executive reports"
    ],
    "accessibleModules": [
      "Dashboard", "Banking Operations", "Incident Management", "Workflow Management & Approvals",
      "Analytics & Reports", "Knowledge Base", "AI Service Desk"
    ]
  },
  {
    "role": "Technical Support Engineer",
    "description": "Deep-dive diagnostic engineer resolving infrastructure & switch failures.",
    "permissions": [
      "View incidents assigned to technical teams",
      "Investigate technical service disruptions (switch codes, ATM sensors)",
      "Access AI troubleshooting recommendations and technical manuals",
      "Update incident status, investigation notes, root causes and resolutions",
      "Inspect core banking service topologies and dependencies"
    ],
    "accessibleModules": [
      "Dashboard", "Incident Management", "Banking Operations", "Knowledge Base", "AI Service Desk"
    ]
  },
  {
    "role": "Operations Analyst",
    "description": "Business intelligence, MTTR/MTBF analysis, and ML failure prediction.",
    "permissions": [
      "View operational analytics, SLA compliance, and MTTR/MTBF trends",
      "Access Predictive Intelligence and run Scikit-learn failure recurrence inference",
      "Monitor banking service availability telemetry",
      "Analyze department workload distributions and recurring failure patterns",
      "Export executive analytical CSV and PDF reports"
    ],
    "accessibleModules": [
      "Dashboard", "Analytics & Reports", "Predictive Intelligence (ML)", "Banking Operations", "Audit Logs"
    ]
  },
  {
    "role": "User",
    "description": "Retail banking customer with self-service complaint tracking, service requests, and AI assistance.",
    "permissions": [
      "Access personal Customer Portal Dashboard & service health status",
      "Raise banking service complaints with real-time GenAI classification",
      "Track personal complaints with live timeline & resolution summaries",
      "Add customer replies and additional details to own complaints",
      "Submit and track customer service requests (Card, Account, Mobile, NetBanking)",
      "Cancel eligible pending service requests before fulfillment begins",
      "Consult 24/7 AI Banking Assistant grounded in verified RAG banking knowledge",
      "Receive real-time notifications on status changes, resolutions & service alerts",
      "Manage customer personal profile and contact preferences"
    ],
    "accessibleModules": [
      "Dashboard", "Raise a Complaint", "My Complaints", "Service Requests",
      "AI Banking Assistant", "Banking Service Status", "Notifications", "My Profile"
    ]
  }
]

@router.get("/roles-permissions")
def get_roles_permissions():
    """Returns the comprehensive RBAC permissions matrix for all 5 roles."""
    return ROLE_PERMISSIONS_MATRIX

@router.get("", response_model=List[UserResponseSchema])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all user accounts. Restricted to Super Admin or Banking Operations Manager."""
    users = db.query(User).order_by(User.id.asc()).all()
    res = []
    for u in users:
        role_val = u.role.value if hasattr(u.role, 'value') else str(u.role)
        res.append(UserResponseSchema(
            id=u.id,
            email=u.email,
            username=u.username,
            full_name=u.full_name,
            role=role_val,
            department=u.department,
            is_active=u.is_active,
            created_at=u.created_at.isoformat() if u.created_at else ""
        ))
    return res

@router.post("", response_model=UserResponseSchema)
def create_user(
    req: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Super Admin", "Admin"))
):
    """Super Admin: Provision a new user account with assigned role and permissions."""
    existing_user = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this username or email already exists.")

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
        department=req.department,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        user_role=current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        action="USER_CREATED",
        entity_type="User",
        entity_id=str(new_user.id),
        details=f"Super Admin created user {new_user.username} with role {new_user.role.value}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    return UserResponseSchema(
        id=new_user.id,
        email=new_user.email,
        username=new_user.username,
        full_name=new_user.full_name,
        role=new_user.role.value,
        department=new_user.department,
        is_active=new_user.is_active,
        created_at=new_user.created_at.isoformat() if new_user.created_at else ""
    )

@router.patch("/{id}", response_model=UserResponseSchema)
def update_user(
    id: int,
    req: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Super Admin", "Admin"))
):
    """Super Admin: Update user information, role assignment, or department."""
    target_user = db.query(User).filter(User.id == id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.full_name is not None:
        target_user.full_name = req.full_name
    if req.email is not None:
        target_user.email = req.email
    if req.role is not None:
        try:
            target_user.role = UserRole(req.role)
        except ValueError:
            pass
    if req.department is not None:
        target_user.department = req.department
    if req.is_active is not None:
        target_user.is_active = req.is_active

    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        user_role=current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        action="USER_UPDATED",
        entity_type="User",
        entity_id=str(target_user.id),
        details=f"Super Admin updated user {target_user.username} (Role: {target_user.role.value}, Active: {target_user.is_active})"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    return UserResponseSchema(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        full_name=target_user.full_name,
        role=target_user.role.value,
        department=target_user.department,
        is_active=target_user.is_active,
        created_at=target_user.created_at.isoformat() if target_user.created_at else ""
    )

@router.patch("/{id}/status", response_model=UserResponseSchema)
def toggle_user_status(
    id: int,
    req: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Super Admin", "Admin"))
):
    """Super Admin: Activate or Deactivate a user account."""
    target_user = db.query(User).filter(User.id == id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if target_user.id == current_user.id and not req.is_active:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own Super Admin account.")

    target_user.is_active = req.is_active
    audit = AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        user_role=current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        action="USER_DEACTIVATED" if not req.is_active else "USER_ACTIVATED",
        entity_type="User",
        entity_id=str(target_user.id),
        details=f"Super Admin {'deactivated' if not req.is_active else 'activated'} user {target_user.username}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    return UserResponseSchema(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        full_name=target_user.full_name,
        role=target_user.role.value,
        department=target_user.department,
        is_active=target_user.is_active,
        created_at=target_user.created_at.isoformat() if target_user.created_at else ""
    )
