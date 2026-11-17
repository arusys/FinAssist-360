import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.service_request import ServiceRequest, RequestStatus, RequestCategory
from app.schemas.all_schemas import ServiceRequestCreate, ServiceRequestUpdate
from app.models.audit_log import AuditLog
from app.models.notification import Notification

class ServiceRequestService:
    @staticmethod
    def get_requests(
        db: Session,
        category: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[ServiceRequest]:
        query = db.query(ServiceRequest)
        if category:
            query = query.filter(ServiceRequest.category == category)
        if status:
            query = query.filter(ServiceRequest.status == status)
        return query.order_by(desc(ServiceRequest.created_at)).offset(offset).limit(limit).all()

    @staticmethod
    def get_request_by_id(db: Session, req_id: int) -> Optional[ServiceRequest]:
        return db.query(ServiceRequest).filter(ServiceRequest.id == req_id).first()

    @staticmethod
    def create_request(db: Session, data: ServiceRequestCreate) -> ServiceRequest:
        req_num = f"REQ-2025-{uuid.uuid4().hex[:6].upper()}"

        try:
            cat_enum = RequestCategory(data.category)
        except ValueError:
            cat_enum = RequestCategory.EMPLOYEE_ACCESS

        new_req = ServiceRequest(
            request_number=req_num,
            title=data.title,
            description=data.description,
            category=cat_enum,
            priority=data.priority,
            status=RequestStatus.SUBMITTED,
            requester_name=data.requester_name,
            requester_email=data.requester_email,
            department=data.department,
            requires_approval=True
        )
        db.add(new_req)
        db.flush()

        audit = AuditLog(
            username=data.requester_name,
            action="SERVICE_REQUEST_SUBMITTED",
            entity_type="ServiceRequest",
            entity_id=req_num,
            details=f"Submitted service request for {cat_enum.value}"
        )
        db.add(audit)

        db.commit()
        db.refresh(new_req)
        return new_req

    @staticmethod
    def update_request(
        db: Session,
        req_id: int,
        data: ServiceRequestUpdate,
        operator_name: str
    ) -> ServiceRequest:
        req = db.query(ServiceRequest).filter(ServiceRequest.id == req_id).first()
        if not req:
            raise ValueError("Service request not found")

        if data.status:
            try:
                req.status = RequestStatus(data.status)
            except ValueError:
                pass
        if data.priority:
            req.priority = data.priority
        if data.assigned_to_id:
            req.assigned_to_id = data.assigned_to_id
        if data.approved_by:
            req.approved_by = data.approved_by
            req.approved_at = datetime.now(timezone.utc)
        if data.rejection_reason:
            req.rejection_reason = data.rejection_reason
        if data.fulfillment_notes:
            req.fulfillment_notes = data.fulfillment_notes

        audit = AuditLog(
            username=operator_name,
            action="SERVICE_REQUEST_UPDATED",
            entity_type="ServiceRequest",
            entity_id=req.request_number,
            details=f"Updated status to {req.status.value}"
        )
        db.add(audit)

        db.commit()
        db.refresh(req)
        return req
