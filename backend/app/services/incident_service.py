import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.incident import Incident, IncidentPriority, IncidentStatus, IncidentCategory, IncidentNote, IncidentHistory
from app.models.user import User
from app.models.banking_service import BankingService
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.all_schemas import IncidentCreate, IncidentUpdate

class IncidentService:
    @staticmethod
    def get_incidents(
        db: Session,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Incident]:
        query = db.query(Incident)

        if category:
            query = query.filter(Incident.category == category)
        if priority:
            query = query.filter(Incident.priority == priority)
        if status:
            query = query.filter(Incident.status == status)
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                (Incident.incident_number.ilike(search_fmt)) |
                (Incident.title.ilike(search_fmt)) |
                (Incident.description.ilike(search_fmt))
            )

        return query.order_by(desc(Incident.created_at)).offset(offset).limit(limit).all()

    @staticmethod
    def get_incident_by_id(db: Session, incident_id: int) -> Optional[Incident]:
        return db.query(Incident).filter(Incident.id == incident_id).first()

    @staticmethod
    def create_incident(db: Session, req: IncidentCreate, creator_name: str = "Support Agent") -> Incident:
        inc_num = f"INC-2025-{uuid.uuid4().hex[:6].upper()}"
        
        try:
            priority_enum = IncidentPriority(req.priority)
        except ValueError:
            priority_enum = IncidentPriority.P3

        try:
            category_enum = IncidentCategory(req.category)
        except ValueError:
            category_enum = IncidentCategory.PAYMENT_FAILURE

        sla_hours = 2 if priority_enum == IncidentPriority.P1 else (4 if priority_enum == IncidentPriority.P2 else (24 if priority_enum == IncidentPriority.P3 else 48))

        new_inc = Incident(
            incident_number=inc_num,
            title=req.title,
            description=req.description,
            category=category_enum,
            priority=priority_enum,
            status=IncidentStatus.NEW,
            service_id=req.service_id,
            assigned_department=req.assigned_department or "Retail Banking Operations",
            reported_by=creator_name,
            customer_identifier=req.customer_identifier,
            sla_due_at=datetime.now(timezone.utc) + timedelta(hours=sla_hours)
        )
        db.add(new_inc)
        db.flush()

        # Add initial history record
        hist = IncidentHistory(
            incident_id=new_inc.id,
            changed_by=creator_name,
            old_status=None,
            new_status="New",
            action="INCIDENT_CREATED",
            details=f"Incident {inc_num} created manually with priority {priority_enum.value}"
        )
        db.add(hist)

        # Audit log
        audit = AuditLog(
            username=creator_name,
            action="INCIDENT_CREATED",
            entity_type="Incident",
            entity_id=inc_num,
            details=f"Created incident: {req.title}"
        )
        db.add(audit)

        db.commit()
        db.refresh(new_inc)
        return new_inc

    @staticmethod
    def assign_incident(db: Session, incident_id: int, assigned_to_id: int, department: Optional[str], operator_name: str) -> Incident:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise ValueError("Incident not found")

        user = db.query(User).filter(User.id == assigned_to_id).first()
        if not user:
            raise ValueError("Assigned user not found")

        old_status = inc.status.value
        inc.assigned_to_id = user.id
        if department:
            inc.assigned_department = department
        inc.status = IncidentStatus.ASSIGNED

        hist = IncidentHistory(
            incident_id=inc.id,
            changed_by=operator_name,
            old_status=old_status,
            new_status="Assigned",
            action="INCIDENT_ASSIGNED",
            details=f"Assigned to {user.full_name} ({user.department})"
        )
        db.add(hist)

        # Notify assigned user
        notif = Notification(
            user_id=user.id,
            title=f"Incident Assigned: {inc.incident_number}",
            message=f"You have been assigned incident '{inc.title}' with priority {inc.priority.value}.",
            notification_type="INCIDENT_ASSIGN",
            entity_type="Incident",
            entity_id=str(inc.id)
        )
        db.add(notif)

        db.commit()
        db.refresh(inc)
        return inc

    @staticmethod
    def resolve_incident(db: Session, incident_id: int, root_cause: str, resolution_notes: str, resolver_name: str) -> Incident:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise ValueError("Incident not found")

        old_status = inc.status.value
        inc.status = IncidentStatus.RESOLVED
        inc.root_cause = root_cause
        inc.resolution_notes = resolution_notes
        inc.resolved_at = datetime.now(timezone.utc)

        hist = IncidentHistory(
            incident_id=inc.id,
            changed_by=resolver_name,
            old_status=old_status,
            new_status="Resolved",
            action="INCIDENT_RESOLVED",
            details=f"Resolved with root cause: {root_cause[:80]}..."
        )
        db.add(hist)

        db.commit()
        db.refresh(inc)
        return inc

    @staticmethod
    def add_note(db: Session, incident_id: int, content: str, author_name: str, author_id: Optional[int] = None, is_internal: bool = True) -> IncidentNote:
        inc = db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            raise ValueError("Incident not found")

        note = IncidentNote(
            incident_id=inc.id,
            author_name=author_name,
            author_id=author_id,
            content=content,
            is_internal=is_internal
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
