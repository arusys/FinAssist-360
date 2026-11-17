from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestResponse
from app.services.request_service import ServiceRequestService
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Service Request Management"])

@router.get("", response_model=List[ServiceRequestResponse])
def list_service_requests(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    requests = ServiceRequestService.get_requests(db, category=category, status=status, limit=limit, offset=offset)

    if current_user.role.value == "User":
        requests = [r for r in requests if r.requester_email == current_user.email]

    result = []
    for r in requests:
        result.append(ServiceRequestResponse(
            id=r.id,
            request_number=r.request_number,
            title=r.title,
            description=r.description,
            category=r.category.value if hasattr(r.category, 'value') else r.category,
            priority=r.priority,
            status=r.status.value if hasattr(r.status, 'value') else r.status,
            requester_name=r.requester_name,
            requester_email=r.requester_email,
            department=r.department,
            assigned_to_id=r.assigned_to_id,
            requires_approval=r.requires_approval,
            approved_by=r.approved_by,
            approved_at=r.approved_at,
            rejection_reason=r.rejection_reason,
            fulfillment_notes=r.fulfillment_notes,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return result

@router.get("/{id}", response_model=ServiceRequestResponse)
def get_request_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = ServiceRequestService.get_request_by_id(db, id)
    if not r:
        raise HTTPException(status_code=404, detail="Service request not found")

    if current_user.role.value == "User" and r.requester_email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied: You can only view your own service requests.")
    return ServiceRequestResponse(
        id=r.id,
        request_number=r.request_number,
        title=r.title,
        description=r.description,
        category=r.category.value if hasattr(r.category, 'value') else r.category,
        priority=r.priority,
        status=r.status.value if hasattr(r.status, 'value') else r.status,
        requester_name=r.requester_name,
        requester_email=r.requester_email,
        department=r.department,
        assigned_to_id=r.assigned_to_id,
        requires_approval=r.requires_approval,
        approved_by=r.approved_by,
        approved_at=r.approved_at,
        rejection_reason=r.rejection_reason,
        fulfillment_notes=r.fulfillment_notes,
        created_at=r.created_at,
        updated_at=r.updated_at
    )

@router.post("", response_model=ServiceRequestResponse)
def create_service_request(
    req: ServiceRequestCreate,
    db: Session = Depends(get_db)
):
    r = ServiceRequestService.create_request(db, req)
    return ServiceRequestResponse(
        id=r.id,
        request_number=r.request_number,
        title=r.title,
        description=r.description,
        category=r.category.value if hasattr(r.category, 'value') else r.category,
        priority=r.priority,
        status=r.status.value if hasattr(r.status, 'value') else r.status,
        requester_name=r.requester_name,
        requester_email=r.requester_email,
        department=r.department,
        assigned_to_id=r.assigned_to_id,
        requires_approval=r.requires_approval,
        approved_by=r.approved_by,
        approved_at=r.approved_at,
        rejection_reason=r.rejection_reason,
        fulfillment_notes=r.fulfillment_notes,
        created_at=r.created_at,
        updated_at=r.updated_at
    )

@router.patch("/{id}", response_model=ServiceRequestResponse)
def update_service_request(
    id: int,
    req: ServiceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        r = ServiceRequestService.update_request(db, id, req, operator_name=current_user.full_name)
        return ServiceRequestResponse(
            id=r.id,
            request_number=r.request_number,
            title=r.title,
            description=r.description,
            category=r.category.value if hasattr(r.category, 'value') else r.category,
            priority=r.priority,
            status=r.status.value if hasattr(r.status, 'value') else r.status,
            requester_name=r.requester_name,
            requester_email=r.requester_email,
            department=r.department,
            assigned_to_id=r.assigned_to_id,
            requires_approval=r.requires_approval,
            approved_by=r.approved_by,
            approved_at=r.approved_at,
            rejection_reason=r.rejection_reason,
            fulfillment_notes=r.fulfillment_notes,
            created_at=r.created_at,
            updated_at=r.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
