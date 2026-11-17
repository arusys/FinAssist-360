from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent

class WorkflowCoordinationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Workflow Coordination Agent",
            role="Department Task Orchestration, Gatekeeper for Human Approvals & SLA Tracking"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        req_info = state.get("customer_request", {})
        class_info = state.get("incident_classification", {})
        txn_info = state.get("transaction_analysis", {})
        amount = req_info.get("extracted_entities", {}).get("amount") or 0.0

        tasks = []
        requires_human_approval = False
        approval_details = None

        dept = class_info.get("assigned_department", "Retail Operations")

        # Step 1: Ledger validation
        tasks.append({
            "task_id": "TSK-01",
            "title": "Verify CBS switch debit and beneficiary settlement logs",
            "department": dept,
            "status": "COMPLETED",
            "assigned_role": "Automated Agent Auditor"
        })

        # Step 2: Auto-reversal check or manual action
        if txn_info.get("reversal_eligible"):
            if amount > 50000:
                requires_human_approval = True
                approval_details = {
                    "action": "MANUAL_REVERSAL_HIGH_VALUE",
                    "description": f"Manual credit reversal authorization required for INR {amount:,.2f} exceeding automated threshold.",
                    "required_role": "Service Manager"
                }
                tasks.append({
                    "task_id": "TSK-02",
                    "title": "Await Service Manager approval for high-value manual refund",
                    "department": "Service Management",
                    "status": "PENDING_APPROVAL",
                    "assigned_role": "Service Manager"
                })
            else:
                tasks.append({
                    "task_id": "TSK-02",
                    "title": "Initiate automated clearing batch queue for T+1 refund reversal",
                    "department": dept,
                    "status": "QUEUED",
                    "assigned_role": "Settlement Engine"
                })

        # Step 3: Customer Notification
        tasks.append({
            "task_id": "TSK-03",
            "title": "Dispatch status acknowledgment SMS and update customer support portal",
            "department": "Customer Experience",
            "status": "QUEUED",
            "assigned_role": "Banking Support Agent"
        })

        return {
            "coordinated_tasks": tasks,
            "requires_human_approval": requires_human_approval,
            "approval_gate": approval_details,
            "workflow_name": "Unified Payment Failure & Dispute Resolution Workflow",
            "estimated_completion_hours": class_info.get("sla_target_hours", 24)
        }
