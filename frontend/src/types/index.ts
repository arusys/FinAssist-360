export type UserRole =
  | 'Super Admin'
  | 'Service Desk Agent'
  | 'Banking Operations Manager'
  | 'Technical Support Engineer'
  | 'Operations Analyst'
  | 'User'
  | 'Customer'
  | 'Admin'
  | 'Service Manager'
  | 'Banking Support Agent';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  department: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAccount {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
}

export interface RolePermissionMatrixItem {
  role: string;
  description: string;
  permissions: string[];
  accessibleModules: string[];
}

export interface Incident {
  id: number;
  incident_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  service_id?: number;
  service_name?: string;
  assigned_department: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  reported_by: string;
  customer_identifier?: string;
  ai_generated: boolean;
  ai_confidence?: string;
  root_cause?: string;
  investigation_summary?: string;
  resolution_notes?: string;
  sla_due_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  notes?: IncidentNote[];
  history?: IncidentHistory[];
}

export interface IncidentNote {
  id: number;
  author_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface IncidentHistory {
  id: number;
  changed_by: string;
  old_status?: string;
  new_status?: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  request_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester_name: string;
  requester_email: string;
  department: string;
  assigned_to_id?: number;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  fulfillment_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceDependency {
  id: number;
  target_service_id: number;
  target_service_name?: string;
  dependency_type: string;
  criticality: string;
  description?: string;
}

export interface BankingService {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  availability: number;
  current_incident_count: number;
  affected_requests_count: number;
  sla_threshold: number;
  dependencies: ServiceDependency[];
}

export interface ServiceImpactResponse {
  failed_service: string;
  failed_service_code: string;
  status: string;
  direct_dependencies: string[];
  indirect_dependents: string[];
  affected_operations: string[];
  active_incidents_count: number;
  impact_severity: string;
  ai_impact_narrative: string;
  recommended_mitigations: string[];
}

export interface AgentStepResult {
  step_order: number;
  agent_name: string;
  agent_role: string;
  status: string;
  input_summary?: string;
  output_data: Record<string, any>;
  execution_time_ms: number;
}

export interface AgentOrchestrationResponse {
  session_id: string;
  query: string;
  status: string;
  total_execution_time_ms: number;
  steps: AgentStepResult[];
  structured_verdict: {
    intent: string;
    service: string;
    priority: string;
    category: string;
    department: string;
    root_cause?: string;
    requires_approval: boolean;
    troubleshooting_steps: string[];
  };
  final_customer_response: string;
  created_incident_id?: number;
  incident_number?: string;
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  category: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  total_chunks: number;
  uploaded_by: string;
  created_at: string;
}

export interface KnowledgeChunkResult {
  document_id: number;
  document_title: string;
  category: string;
  section_name?: string;
  content: string;
  similarity_score: number;
}

export interface KnowledgeSearchResponse {
  query: string;
  answer: string;
  sources: KnowledgeChunkResult[];
  grounded: boolean;
}

export interface Prediction {
  id: number;
  service_id?: number;
  service_name: string;
  recurrence_risk_score: number;
  risk_level: string;
  predicted_frequency_days: number;
  primary_failure_driver?: string;
  recommended_preventive_actions?: string;
  confidence_score: number;
  created_at: string;
}

export interface ModelMetrics {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_training_samples: number;
  features_analyzed: string[];
  training_timestamp: string;
}

export interface WorkflowDefinition {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  stages: string[];
}

export interface WorkflowTask {
  id: number;
  stage_name: string;
  title: string;
  status: string;
  assigned_role?: string;
  assigned_user?: string;
  completed_at?: string;
}

export interface WorkflowExecution {
  id: number;
  workflow_id: number;
  workflow_name: string;
  entity_type: string;
  entity_id: number;
  entity_ref: string;
  current_stage: string;
  status: string;
  started_by: string;
  started_at: string;
  completed_at?: string;
  tasks: WorkflowTask[];
}

export interface Approval {
  id: number;
  execution_id?: number;
  entity_type: string;
  entity_id: number;
  entity_ref: string;
  action_requested: string;
  description: string;
  required_role: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_name?: string;
  decision_reason?: string;
  decided_at?: string;
  created_at: string;
}

export interface DashboardSummary {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
  pending_service_requests: number;
  average_resolution_time_hours: number;
  sla_compliance_percentage: number;
  operational_services_count: number;
  total_services_count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface DailyTrend {
  date: string;
  created: number;
  resolved: number;
}

export interface DepartmentWorkload {
  department: string;
  active_incidents: number;
  resolved_incidents: number;
}

export interface AnalyticsDashboard {
  summary: DashboardSummary;
  incidents_by_category: CategoryCount[];
  incidents_by_severity: SeverityCount[];
  daily_trends: DailyTrend[];
  department_workload: DepartmentWorkload[];
  mttr_hours: number;
  mtbf_days: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  username: string;
  user_role: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address: string;
  created_at: string;
}
