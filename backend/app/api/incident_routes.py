from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import (
    IncidentResponse,
    IncidentDetailResponse,
    IncidentCreate,
    IncidentUpdate,
    IncidentAssignRequest,
    IncidentResolveRequest,
    IncidentNoteCreate,
    IncidentNoteResponse
)
from app.services.incident_service import IncidentService
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incidents = IncidentService.get_incidents(
        db, category=category, priority=priority, status=status, search=search, limit=limit, offset=offset
    )

    # Ownership enforcement for User role (Customer Portal)
    if current_user.role.value == "User":
        incidents = [
            inc for inc in incidents
            if (inc.customer_identifier == current_user.username or inc.reported_by in [current_user.email, current_user.full_name])
        ]

    result = []
    for inc in incidents:
        inc_dict = {
            "id": inc.id,
            "incident_number": inc.incident_number,
            "title": inc.title,
            "description": inc.description,
            "category": inc.category.value if hasattr(inc.category, 'value') else inc.category,
            "priority": inc.priority.value if hasattr(inc.priority, 'value') else inc.priority,
            "status": inc.status.value if hasattr(inc.status, 'value') else inc.status,
            "service_id": inc.service_id,
            "service_name": inc.service.name if inc.service else None,
            "assigned_department": inc.assigned_department,
            "assigned_to_id": inc.assigned_to_id,
            "assigned_to_name": inc.assigned_to.full_name if inc.assigned_to else None,
            "reported_by": inc.reported_by,
            "customer_identifier": inc.customer_identifier,
            "ai_generated": inc.ai_generated,
            "ai_confidence": inc.ai_confidence,
            "root_cause": inc.root_cause,
            "investigation_summary": inc.investigation_summary,
            "resolution_notes": inc.resolution_notes,
            "sla_due_at": inc.sla_due_at,
            "resolved_at": inc.resolved_at,
            "created_at": inc.created_at,
            "updated_at": inc.updated_at
        }
        result.append(IncidentResponse(**inc_dict))
    return result

@router.get("/export/csv")
def export_incidents_csv(db: Session = Depends(get_db)):
    csv_data = AnalyticsService.export_incidents_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=finassist360_incidents_export.csv"}
    )

@router.get("/{id}", response_model=IncidentDetailResponse)
def get_incident_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inc = IncidentService.get_incident_by_id(db, id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    if current_user.role.value == "User":
        if not (inc.customer_identifier == current_user.username or inc.reported_by in [current_user.email, current_user.full_name]):
            raise HTTPException(status_code=403, detail="Access denied: You can only view your own complaints.")

    notes = [
        IncidentNoteResponse(
            id=n.id,
            author_name=n.author_name,
            content=n.content,
            is_internal=n.is_internal,
            created_at=n.created_at
        ) for n in inc.notes
    ]
    history = [
        {
            "id": h.id,
            "changed_by": h.changed_by,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "action": h.action,
            "details": h.details,
            "created_at": h.created_at
        } for h in inc.history
    ]

    return IncidentDetailResponse(
        id=inc.id,
        incident_number=inc.incident_number,
        title=inc.title,
        description=inc.description,
        category=inc.category.value if hasattr(inc.category, 'value') else inc.category,
        priority=inc.priority.value if hasattr(inc.priority, 'value') else inc.priority,
        status=inc.status.value if hasattr(inc.status, 'value') else inc.status,
        service_id=inc.service_id,
        service_name=inc.service.name if inc.service else None,
        assigned_department=inc.assigned_department,
        assigned_to_id=inc.assigned_to_id,
        assigned_to_name=inc.assigned_to.full_name if inc.assigned_to else None,
        reported_by=inc.reported_by,
        customer_identifier=inc.customer_identifier,
        ai_generated=inc.ai_generated,
        ai_confidence=inc.ai_confidence,
        root_cause=inc.root_cause,
        investigation_summary=inc.investigation_summary,
        resolution_notes=inc.resolution_notes,
        sla_due_at=inc.sla_due_at,
        resolved_at=inc.resolved_at,
        created_at=inc.created_at,
        updated_at=inc.updated_at,
        notes=notes,
        history=history
    )

@router.post("", response_model=IncidentResponse)
def create_incident(
    req: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inc = IncidentService.create_incident(db, req, creator_name=current_user.full_name)
    if current_user.role.value == "User":
        inc.customer_identifier = current_user.username
        inc.reported_by = current_user.email
        db.commit()
        db.refresh(inc)
    return IncidentResponse(
        id=inc.id,
        incident_number=inc.incident_number,
        title=inc.title,
        description=inc.description,
        category=inc.category.value if hasattr(inc.category, 'value') else inc.category,
        priority=inc.priority.value if hasattr(inc.priority, 'value') else inc.priority,
        status=inc.status.value if hasattr(inc.status, 'value') else inc.status,
        service_id=inc.service_id,
        service_name=inc.service.name if inc.service else None,
        assigned_department=inc.assigned_department,
        assigned_to_id=inc.assigned_to_id,
        assigned_to_name=inc.assigned_to.full_name if inc.assigned_to else None,
        reported_by=inc.reported_by,
        customer_identifier=inc.customer_identifier,
        ai_generated=inc.ai_generated,
        ai_confidence=inc.ai_confidence,
        root_cause=inc.root_cause,
        investigation_summary=inc.investigation_summary,
        resolution_notes=inc.resolution_notes,
        sla_due_at=inc.sla_due_at,
        resolved_at=inc.resolved_at,
        created_at=inc.created_at,
        updated_at=inc.updated_at
    )

@router.post("/{id}/assign", response_model=IncidentResponse)
def assign_incident(
    id: int,
    req: IncidentAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "User":
        raise HTTPException(status_code=403, detail="Access denied: Customers cannot assign incidents.")
    try:
        inc = IncidentService.assign_incident(
            db, id, req.assigned_to_id, req.assigned_department, operator_name=current_user.full_name
        )
        return IncidentResponse(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            description=inc.description,
            category=inc.category.value if hasattr(inc.category, 'value') else inc.category,
            priority=inc.priority.value if hasattr(inc.priority, 'value') else inc.priority,
            status=inc.status.value if hasattr(inc.status, 'value') else inc.status,
            service_id=inc.service_id,
            service_name=inc.service.name if inc.service else None,
            assigned_department=inc.assigned_department,
            assigned_to_id=inc.assigned_to_id,
            assigned_to_name=inc.assigned_to.full_name if inc.assigned_to else None,
            reported_by=inc.reported_by,
            customer_identifier=inc.customer_identifier,
            ai_generated=inc.ai_generated,
            ai_confidence=inc.ai_confidence,
            root_cause=inc.root_cause,
            investigation_summary=inc.investigation_summary,
            resolution_notes=inc.resolution_notes,
            sla_due_at=inc.sla_due_at,
            resolved_at=inc.resolved_at,
            created_at=inc.created_at,
            updated_at=inc.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/resolve", response_model=IncidentResponse)
def resolve_incident(
    id: int,
    req: IncidentResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value == "User":
        raise HTTPException(status_code=403, detail="Access denied: Customers cannot resolve incidents.")
    try:
        inc = IncidentService.resolve_incident(
            db, id, req.root_cause, req.resolution_notes, resolver_name=current_user.full_name
        )
        return IncidentResponse(
            id=inc.id,
            incident_number=inc.incident_number,
            title=inc.title,
            description=inc.description,
            category=inc.category.value if hasattr(inc.category, 'value') else inc.category,
            priority=inc.priority.value if hasattr(inc.priority, 'value') else inc.priority,
            status=inc.status.value if hasattr(inc.status, 'value') else inc.status,
            service_id=inc.service_id,
            service_name=inc.service.name if inc.service else None,
            assigned_department=inc.assigned_department,
            assigned_to_id=inc.assigned_to_id,
            assigned_to_name=inc.assigned_to.full_name if inc.assigned_to else None,
            reported_by=inc.reported_by,
            customer_identifier=inc.customer_identifier,
            ai_generated=inc.ai_generated,
            ai_confidence=inc.ai_confidence,
            root_cause=inc.root_cause,
            investigation_summary=inc.investigation_summary,
            resolution_notes=inc.resolution_notes,
            sla_due_at=inc.sla_due_at,
            resolved_at=inc.resolved_at,
            created_at=inc.created_at,
            updated_at=inc.updated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/notes", response_model=IncidentNoteResponse)
def add_incident_note(
    id: int,
    req: IncidentNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = IncidentService.add_note(
        db, id, req.content, author_name=current_user.full_name, author_id=current_user.id, is_internal=req.is_internal
    )
    return IncidentNoteResponse(
        id=note.id,
        author_name=note.author_name,
        content=note.content,
        is_internal=note.is_internal,
        created_at=note.created_at
    )
