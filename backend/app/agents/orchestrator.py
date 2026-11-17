import uuid
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.agents.customer_request_agent import CustomerRequestUnderstandingAgent
from app.agents.incident_classification_agent import IncidentClassificationAgent
from app.agents.transaction_analysis_agent import TransactionAnalysisAgent
from app.agents.knowledge_retrieval_agent import KnowledgeRetrievalAgent
from app.agents.root_cause_analysis_agent import RootCauseAnalysisAgent
from app.agents.workflow_coordination_agent import WorkflowCoordinationAgent
from app.agents.resolution_assistant_agent import ResolutionAssistantAgent

from app.models.agent_execution import AgentExecution, AgentStep
from app.models.incident import Incident, IncidentPriority, IncidentStatus, IncidentCategory, IncidentHistory
from app.models.banking_service import BankingService
from app.models.workflow import Approval
from app.models.audit_log import AuditLog
from app.models.notification import Notification

class MultiAgentOrchestrator:
    def __init__(self):
        self.agent1 = CustomerRequestUnderstandingAgent()
        self.agent2 = IncidentClassificationAgent()
        self.agent3 = TransactionAnalysisAgent()
        self.agent4 = KnowledgeRetrievalAgent()
        self.agent5 = RootCauseAnalysisAgent()
        self.agent6 = WorkflowCoordinationAgent()
        self.agent7 = ResolutionAssistantAgent()

    def run_pipeline(
        self,
        query: str,
        customer_id: str = "CUST-98321",
        session_id: Optional[str] = None,
        db: Optional[Session] = None,
        auto_create_incident: bool = True
    ) -> Dict[str, Any]:
        """Executes full 7-agent sequential pipeline with deterministic state passing and database persistence."""
        pipeline_start = time.perf_counter()
        session_id = session_id or f"SES-{uuid.uuid4().hex[:8].upper()}"

        # Preliminary state
        state: Dict[str, Any] = {
            "query": query,
            "customer_id": customer_id,
            "session_id": session_id,
            "db_session": db,
            "incident_number": f"INC-2025-{uuid.uuid4().hex[:6].upper()}"
        }

        steps_log = []

        # --- STEP 1: Understand Customer Request ---
        res1 = self.agent1.execute(state)
        state["customer_request"] = res1["output_data"]
        steps_log.append({
            "step_order": 1,
            "agent_name": res1["agent_name"],
            "agent_role": res1["agent_role"],
            "status": res1["status"],
            "input_summary": f"Customer natural language query: '{query[:80]}...'",
            "output_data": res1["output_data"],
            "execution_time_ms": res1["execution_time_ms"]
        })

        # --- STEP 2: Incident Classification ---
        res2 = self.agent2.execute(state)
        state["incident_classification"] = res2["output_data"]
        steps_log.append({
            "step_order": 2,
            "agent_name": res2["agent_name"],
            "agent_role": res2["agent_role"],
            "status": res2["status"],
            "input_summary": f"Intent: {state['customer_request'].get('intent')}",
            "output_data": res2["output_data"],
            "execution_time_ms": res2["execution_time_ms"]
        })

        # --- STEP 3: Transaction Analysis ---
        res3 = self.agent3.execute(state)
        state["transaction_analysis"] = res3["output_data"]
        steps_log.append({
            "step_order": 3,
            "agent_name": res3["agent_name"],
            "agent_role": res3["agent_role"],
            "status": res3["status"],
            "input_summary": f"Extracted RRN/Amount: {state['customer_request'].get('extracted_entities')}",
            "output_data": res3["output_data"],
            "execution_time_ms": res3["execution_time_ms"]
        })

        # --- STEP 4: Knowledge Retrieval (RAG) ---
        res4 = self.agent4.execute(state)
        state["knowledge_retrieval"] = res4["output_data"]
        steps_log.append({
            "step_order": 4,
            "agent_name": res4["agent_name"],
            "agent_role": res4["agent_role"],
            "status": res4["status"],
            "input_summary": f"Searching RAG KB for policy regarding {state['customer_request'].get('service_name')}",
            "output_data": res4["output_data"],
            "execution_time_ms": res4["execution_time_ms"]
        })

        # --- STEP 5: Root Cause Analysis ---
        res5 = self.agent5.execute(state)
        state["root_cause_analysis"] = res5["output_data"]
        steps_log.append({
            "step_order": 5,
            "agent_name": res5["agent_name"],
            "agent_role": res5["agent_role"],
            "status": res5["status"],
            "input_summary": f"Failure reason: {state['transaction_analysis'].get('detected_failure_reason')}",
            "output_data": res5["output_data"],
            "execution_time_ms": res5["execution_time_ms"]
        })

        # --- STEP 6: Workflow Coordination ---
        res6 = self.agent6.execute(state)
        state["workflow_coordination"] = res6["output_data"]
        steps_log.append({
            "step_order": 6,
            "agent_name": res6["agent_name"],
            "agent_role": res6["agent_role"],
            "status": res6["status"],
            "input_summary": f"Routing tasks for department: {state['incident_classification'].get('assigned_department')}",
            "output_data": res6["output_data"],
            "execution_time_ms": res6["execution_time_ms"]
        })

        # --- STEP 7: Resolution Assistant ---
        res7 = self.agent7.execute(state)
        state["resolution_assistant"] = res7["output_data"]
        steps_log.append({
            "step_order": 7,
            "agent_name": res7["agent_name"],
            "agent_role": res7["agent_role"],
            "status": res7["status"],
            "input_summary": "Synthesizing transparent customer advice & technical closure notes",
            "output_data": res7["output_data"],
            "execution_time_ms": res7["execution_time_ms"]
        })

        total_duration_ms = (time.perf_counter() - pipeline_start) * 1000

        # Create Incident record in DB if requested
        created_incident = None
        if db and auto_create_incident:
            try:
                # Find service ID
                service_obj = db.query(BankingService).filter(
                    BankingService.code == state["customer_request"].get("affected_service_code")
                ).first()
                if not service_obj:
                    service_obj = db.query(BankingService).first()

                # Priority enum mapping
                priority_str = state["incident_classification"].get("priority", "P3 – Medium")
                category_str = state["incident_classification"].get("category", "Payment Failure")
                sla_hours = state["incident_classification"].get("sla_target_hours", 24)

                try:
                    priority_enum = IncidentPriority(priority_str)
                except ValueError:
                    priority_enum = IncidentPriority.P3

                try:
                    category_enum = IncidentCategory(category_str)
                except ValueError:
                    category_enum = IncidentCategory.PAYMENT_FAILURE

                new_inc = Incident(
                    incident_number=state["incident_number"],
                    title=f"{state['customer_request'].get('intent').replace('_', ' ').title()} - {state['customer_request'].get('service_name')}",
                    description=query,
                    category=category_enum,
                    priority=priority_enum,
                    status=IncidentStatus.ASSIGNED,
                    service_id=service_obj.id if service_obj else None,
                    assigned_department=state["incident_classification"].get("assigned_department", "Retail Banking Operations"),
                    reported_by=f"Customer Portal ({customer_id})",
                    customer_identifier=customer_id,
                    ai_generated=True,
                    ai_confidence="94%",
                    root_cause=state["root_cause_analysis"].get("root_cause_summary"),
                    investigation_summary=state["resolution_assistant"].get("internal_closure_notes"),
                    sla_due_at=datetime.now(timezone.utc) + timedelta(hours=sla_hours)
                )
                db.add(new_inc)
                db.flush()

                # Add history
                inc_hist = IncidentHistory(
                    incident_id=new_inc.id,
                    changed_by="Multi-Agent AI Orchestrator",
                    old_status=None,
                    new_status="Assigned",
                    action="INCIDENT_AUTO_CREATED",
                    details=f"Classified by 7 AI agents as {priority_str} priority with SLA {sla_hours}h."
                )
                db.add(inc_hist)

                # If workflow requires human approval, record an Approval entity
                if state["workflow_coordination"].get("requires_human_approval"):
                    app_gate = state["workflow_coordination"].get("approval_gate", {})
                    app_record = Approval(
                        entity_type="Incident",
                        entity_id=new_inc.id,
                        entity_ref=new_inc.incident_number,
                        action_requested=app_gate.get("action", "MANUAL_REVERSAL_HIGH_VALUE"),
                        description=app_gate.get("description", "Manual reversal approval required"),
                        required_role=app_gate.get("required_role", "Service Manager"),
                        status="PENDING"
                    )
                    db.add(app_record)

                # Persist AgentExecution and Steps
                agent_exec = AgentExecution(
                    session_id=session_id,
                    user_query=query,
                    status="COMPLETED",
                    total_agents_involved=7,
                    total_execution_time_ms=round(total_duration_ms, 2),
                    final_response=state["resolution_assistant"].get("customer_response"),
                    created_incident_id=new_inc.id
                )
                db.add(agent_exec)
                db.flush()

                for s in steps_log:
                    step_entity = AgentStep(
                        execution_id=agent_exec.id,
                        step_order=s["step_order"],
                        agent_name=s["agent_name"],
                        agent_role=s["agent_role"],
                        status=s["status"],
                        input_summary=s["input_summary"],
                        output_data_json=json.dumps(s["output_data"]),
                        execution_time_ms=s["execution_time_ms"]
                    )
                    db.add(step_entity)

                # Add notification
                notif = Notification(
                    title=f"New {priority_str} Incident Created: {new_inc.incident_number}",
                    message=f"Multi-Agent AI classified complaint for {state['customer_request'].get('service_name')}.",
                    notification_type="CRITICAL_ALERT" if "P1" in priority_str else "INFO",
                    entity_type="Incident",
                    entity_id=str(new_inc.id)
                )
                db.add(notif)

                # Add Audit Log
                audit = AuditLog(
                    username="AI Orchestrator",
                    user_role="System Agent",
                    action="AI_AGENT_PIPELINE_EXECUTED",
                    entity_type="Incident",
                    entity_id=new_inc.incident_number,
                    details=f"Executed 7 agents for query '{query[:60]}...'. Result: {new_inc.incident_number}"
                )
                db.add(audit)

                db.commit()
                created_incident = new_inc
            except Exception as e:
                db.rollback()
                print(f"Error persisting agent execution or incident: {e}")

        return {
            "session_id": session_id,
            "query": query,
            "status": "COMPLETED",
            "total_execution_time_ms": round(total_duration_ms, 2),
            "steps": steps_log,
            "structured_verdict": {
                "intent": state["customer_request"].get("intent"),
                "service": state["customer_request"].get("service_name"),
                "priority": state["incident_classification"].get("priority"),
                "category": state["incident_classification"].get("category"),
                "department": state["incident_classification"].get("assigned_department"),
                "root_cause": state["root_cause_analysis"].get("root_cause_summary"),
                "requires_approval": state["workflow_coordination"].get("requires_human_approval"),
                "troubleshooting_steps": state["resolution_assistant"].get("troubleshooting_steps")
            },
            "final_customer_response": state["resolution_assistant"].get("customer_response"),
            "created_incident_id": created_incident.id if created_incident else None,
            "incident_number": created_incident.incident_number if created_incident else state["incident_number"]
        }

# Global orchestrator singleton
global_orchestrator = MultiAgentOrchestrator()
