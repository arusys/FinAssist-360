from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import AIChatRequest, AgentOrchestrationResponse, AgentStepResult
from app.agents.orchestrator import global_orchestrator
from app.models.agent_execution import AgentExecution, AgentStep
import json

from app.models.incident import Incident
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Service Desk & Multi-Agent Orchestration"])

@router.post("/chat", response_model=AgentOrchestrationResponse)
def ai_chat_service_desk(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer-facing GenAI Service Desk endpoint powered by 7-Agent Orchestration Pipeline."""
    if not req.message or len(req.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Complaint message cannot be empty.")

    cust_id = current_user.username if current_user else (req.customer_id or "CUST-98321")
    result = global_orchestrator.run_pipeline(
        query=req.message,
        customer_id=cust_id,
        session_id=req.session_id,
        db=db,
        auto_create_incident=True
    )

    if result.get("created_incident_id") and current_user:
        inc = db.query(Incident).filter(Incident.id == result["created_incident_id"]).first()
        if inc:
            inc.customer_identifier = current_user.username
            inc.reported_by = current_user.email
            db.commit()

    steps = [AgentStepResult(**s) for s in result["steps"]]

    return AgentOrchestrationResponse(
        session_id=result["session_id"],
        query=result["query"],
        status=result["status"],
        total_execution_time_ms=result["total_execution_time_ms"],
        steps=steps,
        structured_verdict=result["structured_verdict"],
        final_customer_response=result["final_customer_response"],
        created_incident_id=result.get("created_incident_id"),
        incident_number=result.get("incident_number")
    )

@router.post("/classify")
def classify_complaint(
    req: AIChatRequest,
    db: Session = Depends(get_db)
):
    """Direct fast classification using Agent 1 (Understanding) & Agent 2 (Classification)."""
    state = {
        "query": req.message,
        "customer_id": req.customer_id,
        "db_session": db
    }
    res1 = global_orchestrator.agent1.execute(state)
    state["customer_request"] = res1["output_data"]
    res2 = global_orchestrator.agent2.execute(state)

    return {
        "intent": res1["output_data"].get("intent"),
        "service": res1["output_data"].get("service_name"),
        "entities": res1["output_data"].get("extracted_entities"),
        "classification": res2["output_data"]
    }

@router.get("/conversations")
def get_agent_conversations(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Retrieve history of AI agent executions and steps."""
    executions = db.query(AgentExecution).order_by(desc(AgentExecution.created_at)).limit(limit).all()
    results = []
    for ex in executions:
        step_items = []
        for s in ex.steps:
            try:
                out_data = json.loads(s.output_data_json)
            except Exception:
                out_data = {}
            step_items.append({
                "step_order": s.step_order,
                "agent_name": s.agent_name,
                "agent_role": s.agent_role,
                "status": s.status,
                "input_summary": s.input_summary,
                "output_data": out_data,
                "execution_time_ms": s.execution_time_ms
            })
        results.append({
            "id": ex.id,
            "session_id": ex.session_id,
            "query": ex.user_query,
            "status": ex.status,
            "total_agents": ex.total_agents_involved,
            "duration_ms": ex.total_execution_time_ms,
            "final_response": ex.final_response,
            "incident_id": ex.created_incident_id,
            "created_at": ex.created_at,
            "steps": step_items
        })
    return results
