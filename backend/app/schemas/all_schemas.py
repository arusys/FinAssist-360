from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# ----------------- User & Auth Schemas -----------------
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    email: str
    username: str
    full_name: str
    password: str
    role: str = "Service Desk Agent"
    department: str = "Retail Banking Operations"

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    department: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

# ----------------- Banking Service Schemas -----------------
class ServiceDependencySchema(BaseModel):
    id: int
    target_service_id: int
    target_service_name: Optional[str] = None
    dependency_type: str
    criticality: str
    description: Optional[str] = None

class BankingServiceSchema(BaseModel):
    id: int
    name: str
    code: str
    category: str
    description: Optional[str] = None
    status: str
    availability: float
    current_incident_count: int
    affected_requests_count: int
    sla_threshold: float
    dependencies: List[ServiceDependencySchema] = []

    class Config:
        from_attributes = True

class ServiceImpactAnalysisRequest(BaseModel):
    service_id: int
    simulated_failure_state: str = "Outage"

class ServiceImpactAnalysisResponse(BaseModel):
    failed_service: str
    failed_service_code: str
    status: str
    direct_dependencies: List[str]
    indirect_dependents: List[str]
    affected_operations: List[str]
    active_incidents_count: int
    impact_severity: str  # Critical, High, Moderate
    ai_impact_narrative: str
    recommended_mitigations: List[str]

# ----------------- Incident Schemas -----------------
class IncidentNoteCreate(BaseModel):
    content: str
    is_internal: bool = True

class IncidentNoteResponse(BaseModel):
    id: int
    author_name: str
    content: str
    is_internal: bool
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentHistoryResponse(BaseModel):
    id: int
    changed_by: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "P3 – Medium"
    service_id: Optional[int] = None
    customer_identifier: Optional[str] = None
    assigned_department: Optional[str] = "Retail Banking Operations"

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    service_id: Optional[int] = None
    assigned_department: Optional[str] = None
    assigned_to_id: Optional[int] = None
    root_cause: Optional[str] = None
    resolution_notes: Optional[str] = None

class IncidentAssignRequest(BaseModel):
    assigned_to_id: int
    assigned_department: Optional[str] = None

class IncidentResolveRequest(BaseModel):
    root_cause: str
    resolution_notes: str

class IncidentResponse(BaseModel):
    id: int
    incident_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    service_id: Optional[int] = None
    service_name: Optional[str] = None
    assigned_department: str
    assigned_to_id: Optional[int] = None
    assigned_to_name: Optional[str] = None
    reported_by: str
    customer_identifier: Optional[str] = None
    ai_generated: bool
    ai_confidence: Optional[str] = None
    root_cause: Optional[str] = None
    investigation_summary: Optional[str] = None
    resolution_notes: Optional[str] = None
    sla_due_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IncidentDetailResponse(IncidentResponse):
    notes: List[IncidentNoteResponse] = []
    history: List[IncidentHistoryResponse] = []

# ----------------- Service Request Schemas -----------------
class ServiceRequestCreate(BaseModel):
    title: str
    description: str
    category: str
    priority: str = "Medium"
    requester_name: str
    requester_email: str
    department: str

class ServiceRequestUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[int] = None
    approved_by: Optional[str] = None
    rejection_reason: Optional[str] = None
    fulfillment_notes: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: int
    request_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    requester_name: str
    requester_email: str
    department: str
    assigned_to_id: Optional[int] = None
    requires_approval: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    fulfillment_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- AI Service Desk & Agent Schemas -----------------
class AIChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = "CUST-98321"
    session_id: Optional[str] = None

class AgentStepResult(BaseModel):
    step_order: int
    agent_name: str
    agent_role: str
    status: str
    input_summary: Optional[str] = None
    output_data: Dict[str, Any]
    execution_time_ms: float

class AgentOrchestrationResponse(BaseModel):
    session_id: str
    query: str
    status: str
    total_execution_time_ms: float
    steps: List[AgentStepResult]
    structured_verdict: Dict[str, Any]
    final_customer_response: str
    created_incident_id: Optional[int] = None
    incident_number: Optional[str] = None

# ----------------- Knowledge Base Schemas -----------------
class KnowledgeSearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: int = 4

class KnowledgeChunkResult(BaseModel):
    document_id: int
    document_title: str
    category: str
    section_name: Optional[str] = None
    content: str
    similarity_score: float

class KnowledgeSearchResponse(BaseModel):
    query: str
    answer: str
    sources: List[KnowledgeChunkResult]
    grounded: bool

class KnowledgeDocResponse(BaseModel):
    id: int
    title: str
    category: str
    filename: str
    file_type: str
    file_size_bytes: int
    total_chunks: int
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Predictive Intelligence Schemas -----------------
class PredictionResponse(BaseModel):
    id: int
    service_id: Optional[int] = None
    service_name: str
    recurrence_risk_score: float
    risk_level: str
    predicted_frequency_days: float
    primary_failure_driver: Optional[str] = None
    recommended_preventive_actions: Optional[str] = None
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class ModelMetricsResponse(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    total_training_samples: int
    features_analyzed: List[str]
    training_timestamp: str

# ----------------- Workflow & Approvals Schemas -----------------
class WorkflowTaskResponse(BaseModel):
    id: int
    stage_name: str
    title: str
    status: str
    assigned_role: Optional[str] = None
    assigned_user: Optional[str] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowExecutionResponse(BaseModel):
    id: int
    workflow_id: int
    workflow_name: str
    entity_type: str
    entity_id: int
    entity_ref: str
    current_stage: str
    status: str
    started_by: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    tasks: List[WorkflowTaskResponse] = []

    class Config:
        from_attributes = True

class ApprovalDecisionRequest(BaseModel):
    approved: bool
    decision_reason: str

class ApprovalResponse(BaseModel):
    id: int
    execution_id: Optional[int] = None
    entity_type: str
    entity_id: int
    entity_ref: str
    action_requested: str
    description: str
    required_role: str
    status: str
    approver_name: Optional[str] = None
    decision_reason: Optional[str] = None
    decided_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Dashboard & Analytics Schemas -----------------
class DashboardSummaryResponse(BaseModel):
    total_incidents: int
    open_incidents: int
    critical_incidents: int
    resolved_incidents: int
    pending_service_requests: int
    average_resolution_time_hours: float
    sla_compliance_percentage: float
    operational_services_count: int
    total_services_count: int

class CategoryCount(BaseModel):
    category: str
    count: int

class SeverityCount(BaseModel):
    severity: str
    count: int

class DailyTrend(BaseModel):
    date: str
    created: int
    resolved: int

class DepartmentWorkload(BaseModel):
    department: str
    active_incidents: int
    resolved_incidents: int

class AnalyticsDashboardResponse(BaseModel):
    summary: DashboardSummaryResponse
    incidents_by_category: List[CategoryCount]
    incidents_by_severity: List[SeverityCount]
    daily_trends: List[DailyTrend]
    department_workload: List[DepartmentWorkload]
    mttr_hours: float
    mtbf_days: float

# ----------------- Audit & Notification Schemas -----------------
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: str
    user_role: str
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
