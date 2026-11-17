import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.workflow import WorkflowDefinition, WorkflowExecution, WorkflowTask, Approval
from app.models.incident import Incident, IncidentStatus, IncidentHistory
from app.models.audit_log import AuditLog
from app.workflows.definitions import STANDARD_WORKFLOWS

class WorkflowEngine:
    @staticmethod
    def initialize_definitions(db: Session) -> None:
        """Seed default workflow definitions if they don't exist."""
        for wf in STANDARD_WORKFLOWS:
            existing = db.query(WorkflowDefinition).filter(WorkflowDefinition.code == wf["code"]).first()
            if not existing:
                new_def = WorkflowDefinition(
                    code=wf["code"],
                    name=wf["name"],
                    category=wf["category"],
                    description=wf["description"],
                    stages_json=json.dumps(wf["stages"]),
                    is_active=True
                )
                db.add(new_def)
        db.commit()

    @staticmethod
    def start_workflow(
        db: Session,
        workflow_code: str,
        entity_type: str,
        entity_id: int,
        entity_ref: str,
        started_by: str = "System"
    ) -> WorkflowExecution:
        """Instantiates a workflow execution and generates all sequential tasks."""
        wf_def = db.query(WorkflowDefinition).filter(WorkflowDefinition.code == workflow_code).first()
        if not wf_def:
            raise ValueError(f"Workflow definition {workflow_code} not found.")

        stages = json.loads(wf_def.stages_json)

        execution = WorkflowExecution(
            workflow_id=wf_def.id,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_ref=entity_ref,
            current_stage=stages[0] if stages else "Initialization",
            status="IN_PROGRESS",
            started_by=started_by
        )
        db.add(execution)
        db.flush()

        # Create tasks for each stage
        for idx, stage in enumerate(stages):
            status = "IN_PROGRESS" if idx == 0 else "PENDING"
            task = WorkflowTask(
                execution_id=execution.id,
                stage_name=stage,
                title=f"Execute: {stage}",
                status=status,
                assigned_role="Banking Support Agent" if idx < 3 else "Service Manager"
            )
            db.add(task)

        db.commit()
        db.refresh(execution)
        return execution

    @staticmethod
    def process_approval(
        db: Session,
        approval_id: int,
        approved: bool,
        approver_name: str,
        reason: str
    ) -> Approval:
        """Handles human approval or rejection of an operational action."""
        approval = db.query(Approval).filter(Approval.id == approval_id).first()
        if not approval:
            raise ValueError(f"Approval with ID {approval_id} not found.")

        approval.status = "APPROVED" if approved else "REJECTED"
        approval.approver_name = approver_name
        approval.decision_reason = reason
        approval.decided_at = datetime.now(timezone.utc)

        # Log audit entry
        audit = AuditLog(
            username=approver_name,
            user_role=approval.required_role,
            action=f"WORKFLOW_APPROVAL_{approval.status}",
            entity_type=approval.entity_type,
            entity_id=approval.entity_ref,
            details=f"Decision: {approval.status}. Reason: {reason}"
        )
        db.add(audit)

        # Update linked incident or execution if needed
        if approval.entity_type == "Incident":
            incident = db.query(Incident).filter(Incident.id == approval.entity_id).first()
            if incident:
                hist = IncidentHistory(
                    incident_id=incident.id,
                    changed_by=approver_name,
                    old_status=incident.status.value,
                    new_status=incident.status.value,
                    action=f"APPROVAL_{approval.status}",
                    details=f"Action '{approval.action_requested}' was {approval.status.lower()} by {approver_name}: {reason}"
                )
                db.add(hist)

        db.commit()
        db.refresh(approval)
        return approval
