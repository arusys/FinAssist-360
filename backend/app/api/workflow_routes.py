import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import (
    WorkflowExecutionResponse,
    WorkflowTaskResponse,
    ApprovalResponse,
    ApprovalDecisionRequest
)
from app.models.workflow import WorkflowDefinition, WorkflowExecution, WorkflowTask, Approval
from app.workflows.engine import WorkflowEngine
from app.models.user import User

router = APIRouter(prefix="/workflows", tags=["Visual Workflow Automation & Approvals"])

@router.get("/definitions")
def get_workflow_definitions(db: Session = Depends(get_db)):
    defs = db.query(WorkflowDefinition).filter(WorkflowDefinition.is_active == True).all()
    res = []
    for d in defs:
        res.append({
            "id": d.id,
            "code": d.code,
            "name": d.name,
            "category": d.category,
            "description": d.description,
            "stages": json.loads(d.stages_json)
        })
    return res

@router.get("/executions", response_model=List[WorkflowExecutionResponse])
def get_workflow_executions(db: Session = Depends(get_db)):
    execs = db.query(WorkflowExecution).order_by(WorkflowExecution.started_at.desc()).all()
    result = []
    for e in execs:
        tasks = [
            WorkflowTaskResponse(
                id=t.id,
                stage_name=t.stage_name,
                title=t.title,
                status=t.status,
                assigned_role=t.assigned_role,
                assigned_user=t.assigned_user,
                completed_at=t.completed_at
            ) for t in e.tasks
        ]
        result.append(WorkflowExecutionResponse(
            id=e.id,
            workflow_id=e.workflow_id,
            workflow_name=e.workflow.name if e.workflow else "Workflow",
            entity_type=e.entity_type,
            entity_id=e.entity_id,
            entity_ref=e.entity_ref,
            current_stage=e.current_stage,
            status=e.status,
            started_by=e.started_by,
            started_at=e.started_at,
            completed_at=e.completed_at,
            tasks=tasks
        ))
    return result

@router.get("/approvals", response_model=List[ApprovalResponse])
def get_pending_approvals(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Approval)
    if status:
        query = query.filter(Approval.status == status)
    approvals = query.order_by(Approval.created_at.desc()).all()
    return approvals

@router.post("/approvals/{id}/action", response_model=ApprovalResponse)
def decide_approval(
    id: int,
    req: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        app_obj = WorkflowEngine.process_approval(
            db,
            approval_id=id,
            approved=req.approved,
            approver_name=current_user.full_name,
            reason=req.decision_reason
        )
        return app_obj
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
