# FinAssist 360 – REST API Specification

Base URL: `http://localhost:8000/api`

Interactive OpenAPI / Swagger Documentation: `http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and issues a Bearer JWT token.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@finassist360.bank",
      "username": "admin",
      "full_name": "Sarah Jenkins (Chief Technology Officer)",
      "role": "Admin",
      "department": "Executive IT & Risk"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves current profile from validated token.

---

## 2. AI Service Desk & Multi-Agent Orchestration

### `POST /api/ai/chat`
Processes natural-language complaints through the 7-agent sequential orchestration pipeline and automatically generates an incident record in the database.
- **Request Body:**
  ```json
  {
    "message": "My UPI payment of Rs. 4,299 was deducted at Flipkart checkout, but the merchant did not receive money. RRN is RRN9928340192.",
    "customer_id": "CUST-98321"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "session_id": "SES-D94A1F20",
    "query": "My UPI payment of Rs. 4,299 was deducted at Flipkart checkout...",
    "status": "COMPLETED",
    "total_execution_time_ms": 118.4,
    "steps": [
      {
        "step_order": 1,
        "agent_name": "Customer Request Understanding Agent",
        "agent_role": "Intent Recognition & Entity Extraction",
        "status": "SUCCESS",
        "output_data": {
          "intent": "PAYMENT_DEBIT_WITHOUT_CREDIT",
          "service_name": "UPI Payment Service",
          "extracted_entities": {
            "amount": 4299.0,
            "reference_rrn": "RRN9928340192",
            "merchant_name": "Flipkart"
          }
        },
        "execution_time_ms": 14.2
      }
    ],
    "structured_verdict": {
      "intent": "PAYMENT_DEBIT_WITHOUT_CREDIT",
      "service": "UPI Payment Service",
      "priority": "P3 – Medium",
      "category": "Payment Failure",
      "department": "Retail Payments & Settlements",
      "root_cause": "Transient TCP handshake timeout on NPCI Switch...",
      "requires_approval": false,
      "troubleshooting_steps": [
        "Do not attempt duplicate payments to the merchant until the status is resolved.",
        "Check your bank account statement after 24 hours for the auto-reversal credit entry."
      ]
    },
    "final_customer_response": "Dear Customer,\n\nWe have investigated your transaction of INR 4,299.00 (Reference: RRN9928340192)...",
    "created_incident_id": 33,
    "incident_number": "INC-2025-00102"
  }
  ```

---

## 3. Incident Management

### `GET /api/incidents`
Lists incidents with optional filtering.
- **Query Parameters:** `category`, `priority`, `status`, `search`, `limit`, `offset`.

### `GET /api/incidents/{id}`
Returns incident details, full internal notes list, and audit history timeline.

### `POST /api/incidents/{id}/assign`
Assigns incident to designated technician and updates status to `Assigned`.

### `POST /api/incidents/{id}/resolve`
Marks incident as `Resolved` with mandatory `root_cause` and `resolution_notes`.

### `GET /api/incidents/export/csv`
Streams real-time CSV dump of all incident records.

---

## 4. Banking Operations & Impact Analysis

### `GET /api/services`
Lists all 7 core banking services with live availability percentages and incident counts.

### `POST /api/services/impact-analysis`
Computes downstream blast radius for a simulated failure.
- **Request Body:**
  ```json
  {
    "service_id": 1,
    "simulated_failure_state": "Outage"
  }
  ```
- **Response:**
  ```json
  {
    "failed_service": "Payment Gateway Service",
    "impact_severity": "Critical",
    "indirect_dependents": ["UPI Payment Service", "Card Processing Service", "Internet Banking Service"],
    "affected_operations": ["E-Commerce Merchant Checkout", "Instant P2M QR settlements"],
    "recommended_mitigations": ["Activate secondary standby Payment Aggregator tunnel..."]
  }
  ```

---

## 5. RAG Knowledge Base

### `POST /api/knowledge/search`
Executes vector similarity search and returns grounded answers citing source documents.
- **Request Body:**
  ```json
  {
    "query": "What is the auto-reversal timeline for failed UPI payments?",
    "top_k": 3
  }
  ```

### `POST /api/knowledge/upload`
Uploads and vectorizes new policy documents (`multipart/form-data`).

---

## 6. Predictive Intelligence (ML)

### `GET /api/predictions/metrics`
Returns test evaluation metrics from the Random Forest model: accuracy, precision, recall, f1_score.

### `POST /api/predictions/run?service_id=1`
Executes model inference for target service.
