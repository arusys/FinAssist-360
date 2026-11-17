import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.incident import Incident
from app.models.service_request import ServiceRequest
from app.models.banking_service import BankingService

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FinAssist 360" in data["service"]

def test_auth_login_admin():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] in ["Super Admin", "Admin"]

def test_auth_login_invalid():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "WrongPassword"})
    assert response.status_code == 401

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_incidents"] >= 30
    assert data["total_services_count"] >= 7
    assert data["sla_compliance_percentage"] > 0

def test_dashboard_analytics():
    response = client.get("/api/dashboard/analytics")
    assert response.status_code == 200
    data = response.json()
    assert len(data["incidents_by_category"]) > 0
    assert len(data["incidents_by_severity"]) > 0
    assert len(data["daily_trends"]) == 7

def test_list_incidents():
    response = client.get("/api/incidents?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "incident_number" in data[0]

def test_create_incident_manual():
    payload = {
        "title": "Automated Test Incident - Branch Network Flapping",
        "description": "Network switch dropping frames between branch 104 and core switch.",
        "category": "Banking Infrastructure",
        "priority": "P2 – High",
        "assigned_department": "Core Infrastructure & Switching"
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["priority"] == "P2 – High"

def test_list_service_requests():
    response = client.get("/api/requests?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_rag_knowledge_search():
    payload = {
        "query": "What is the auto-reversal SLA for failed UPI transactions?",
        "top_k": 3
    }
    response = client.post("/api/knowledge/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is True
    assert len(data["sources"]) > 0
    assert "T+1" in data["answer"] or "reversal" in data["answer"].lower()

def test_rag_knowledge_fallback_unknown():
    payload = {
        "query": "Quantum cryptography hyperdrive orbital mechanics",
        "top_k": 3
    }
    response = client.post("/api/knowledge/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "does not contain enough information" in data["answer"]
    assert data["grounded"] is False

def test_multi_agent_orchestration_chat():
    payload = {
        "message": "My UPI payment of Rs. 4299 was deducted at Flipkart but merchant didn't receive money. RRN is RRN9928340192.",
        "customer_id": "CUST-98321"
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert len(data["steps"]) == 7  # 7 agents executed
    assert "final_customer_response" in data
    assert data["incident_number"] is not None
    assert "T+1" in data["final_customer_response"] or "reversal" in data["final_customer_response"].lower()

def test_cross_service_impact_analysis():
    # Find Payment Gateway service id
    services_res = client.get("/api/services")
    assert services_res.status_code == 200
    services = services_res.json()
    gw_service = next(s for s in services if s["code"] == "PAYMENT_GATEWAY")

    payload = {
        "service_id": gw_service["id"],
        "simulated_failure_state": "Outage"
    }
    response = client.post("/api/services/impact-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["failed_service_code"] == "PAYMENT_GATEWAY"
    assert len(data["affected_operations"]) > 0
    assert len(data["recommended_mitigations"]) > 0
    assert data["impact_severity"] == "Critical"

def test_predictive_intelligence_metrics():
    response = client.get("/api/predictions/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert data["accuracy"] >= 0.70
    assert "features_analyzed" in data

def test_workflow_definitions():
    response = client.get("/api/workflows/definitions")
    assert response.status_code == 200
    defs = response.json()
    assert len(defs) >= 3

def test_approvals_list_and_action():
    # List approvals
    response = client.get("/api/workflows/approvals")
    assert response.status_code == 200
    apps = response.json()
    assert len(apps) > 0
    app_id = apps[0]["id"]

    # Action approval
    action_payload = {
        "approved": True,
        "decision_reason": "Approved manual credit after verifying NPCI timeout logs."
    }
    action_res = client.post(f"/api/workflows/approvals/{app_id}/action", json=action_payload)
    assert action_res.status_code == 200
    updated = action_res.json()
    assert updated["status"] == "APPROVED"

def test_user_management_rbac_endpoints():
    # Test permissions matrix
    res = client.get("/api/users/roles-permissions")
    assert res.status_code == 200
    matrix = res.json()
    assert len(matrix) >= 5
    roles = [m["role"] for m in matrix]
    assert "Super Admin" in roles
    assert "Service Desk Agent" in roles
    assert "Banking Operations Manager" in roles
    assert "Technical Support Engineer" in roles
    assert "Operations Analyst" in roles
    assert "User" in roles

    # Test list users
    users_res = client.get("/api/users")
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 5

    # Test create user
    import uuid
    unique_suffix = uuid.uuid4().hex[:6]
    new_user_payload = {
        "email": f"testagent_{unique_suffix}@finassist360.bank",
        "username": f"testagent_{unique_suffix}",
        "full_name": "Test Support Agent",
        "password": "Password@123",
        "role": "Service Desk Agent",
        "department": "Retail Operations"
    }
    create_res = client.post("/api/users", json=new_user_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["role"] == "Service Desk Agent"
    user_id = created["id"]

    # Test deactivate user
    status_res = client.patch(f"/api/users/{user_id}/status", json={"is_active": False})
    assert status_res.status_code == 200
    assert status_res.json()["is_active"] is False

    # Deactivated user CANNOT log in (must return 403)
    login_attempt = client.post("/api/auth/login", json={
        "username": f"testagent_{unique_suffix}",
        "password": "Password@123"
    })
    assert login_attempt.status_code == 403

    # Re-activate user
    activate_res = client.patch(f"/api/users/{user_id}/status", json={"is_active": True})
    assert activate_res.status_code == 200
    assert activate_res.json()["is_active"] is True

    # Active user CAN log in
    login_success = client.post("/api/auth/login", json={
        "username": f"testagent_{unique_suffix}",
        "password": "Password@123"
    })
    assert login_success.status_code == 200

def test_customer_portal_endpoints():
    # Customer login
    login_res = client.post("/api/auth/login", json={"username": "user", "password": "User@123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Customer dashboard
    dash_res = client.get("/api/customer/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "stats" in dash_data
    assert "recent_complaints" in dash_data
    assert "banking_service_status" in dash_data

    # AI Analyze complaint
    ai_res = client.post("/api/customer/complaints/ai-analyze", json={
        "title": "ATM card swallowed",
        "description": "The ATM machine kept my card and did not return it"
    }, headers=headers)
    assert ai_res.status_code == 200
    assert "suggested_category" in ai_res.json()

    # Submit complaint
    complaint_res = client.post("/api/customer/complaints", json={
        "title": "UPI transfer failed at merchant store",
        "description": "Paid Rs 1,500 using UPI QR code, debited from account but merchant did not receive.",
        "category": "Payment Failure",
        "transaction_reference": "UPI491829104",
        "ai_applied": True
    }, headers=headers)
    assert complaint_res.status_code == 200
    c_data = complaint_res.json()
    assert c_data["complaint_id"].startswith("CMP-")
    complaint_id = c_data["id"]

    # Get customer complaints list
    list_res = client.get("/api/customer/complaints", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Get complaint detail with tracking timeline
    detail_res = client.get(f"/api/customer/complaints/{complaint_id}", headers=headers)
    assert detail_res.status_code == 200
    assert len(detail_res.json()["workflow_stages"]) == 9

    # Reply to complaint
    reply_res = client.post(f"/api/customer/complaints/{complaint_id}/reply", json={
        "content": "Merchant provided bank statement showing payment failure."
    }, headers=headers)
    assert reply_res.status_code == 200

    # Service requests list & submit
    req_res = client.post("/api/customer/requests", json={
        "title": "Enable International E-Commerce Payments",
        "description": "Please enable international card payments for subscription billing.",
        "category": "Card Support",
        "priority": "Medium"
    }, headers=headers)
    assert req_res.status_code == 200
    new_req_id = req_res.json()["id"]

    # Cancel service request
    cancel_res = client.post(f"/api/customer/requests/{new_req_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "Cancelled"

    # AI Banking Assistant
    chat_res = client.post("/api/customer/ai-assistant", json={
        "message": "What is the status of my recent complaints?"
    }, headers=headers)
    assert chat_res.status_code == 200
    assert len(chat_res.json()["answer"]) > 0
