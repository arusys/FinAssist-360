# FinAssist 360 – GenAI-Based Banking Service Management

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Random%20Forest%20(89%25%20Acc)-F7931E.svg)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, Unified Service Management (USM) web platform for modern banking operations. FinAssist 360 demonstrates how **Generative AI**, **Retrieval-Augmented Generation (RAG)**, **7-Agent Orchestration**, **Machine Learning**, and **Dependency Blast-Radius Intelligence** integrate seamlessly into institutional financial workflows.

---

## Key Features

1. **AI Service Desk & GenAI Intake**: Natural-language banking complaint intake (UPI disputes, ATM failures, card declines, mobile app login errors).
2. **Dedicated Customer Self-Service Portal (`User` Role)**:
   - **User Dashboard**: Real-time summary cards, open/resolved complaint tracking, banking switch health indicators, and direct alerts.
   - **Raise a Complaint**: Multi-category complaint intake with instant GenAI triage, recommended category & priority, and pre-submission troubleshooting guidance.
   - **My Complaints & 9-Stage Tracking Workflow**: Strict ownership isolation (customers only see their own cases) with visual progress across all 9 stages: *Complaint Submitted → AI Classification → Incident Created → Assigned to Service Desk → Technical Investigation → Resolution Proposed → Authorized Approval if Required → Resolved → Customer Notified*. Includes complaint history, customer reply/notes, and final resolution summaries.
   - **Service Requests**: Card support, account access assistance, mobile & internet banking support with status tracking and conditional cancellation rules.
   - **AI Banking Assistant**: Interactive RAG-grounded chat assistant that answers procedural questions, checks complaint status in real time, and provides platform deep-links while preventing hallucinations and data leakage.
   - **Banking Service Status**: Public-facing switch availability and uptime telemetry for UPI, ATM, NEFT/RTGS, Mobile Banking, and Net Banking.
   - **Notifications & Profile Management**: Real-time notifications on complaint milestones, service disruptions, and customer contact detail management.
3. **7-Agent Sequential Orchestration**:
   - `Agent 1`: Customer Request Understanding (intent, entity extraction, RRN, sentiment).
   - `Agent 2`: Incident Classification (P1-P4 priority, category, department routing).
   - `Agent 3`: Transaction Analysis (CBS ledger verification, NPCI switch response code 91, duplicate debit checks).
   - `Agent 4`: Knowledge Retrieval Agent (RAG policy search across banking SOPs and SLA directives).
   - `Agent 5`: Root Cause Analysis (cross-service dependency tracing and blast radius reasoning).
   - `Agent 6`: Workflow Coordination (task generation & managerial approval enforcement for actions > ₹50,000).
   - `Agent 7`: Resolution Assistant (transparent, empathetic customer response synthesis & case closure dossier).
4. **RAG Knowledge Base**: Semantic vector search with TF-IDF cosine similarity, document chunking, and grounded source citations. Fallback guardrails prevent hallucination when queries exceed knowledge boundaries.
5. **Cross-Service Impact Analysis**: Visual dependency topology map across 7 simulated banking services with downstream blast-radius analysis and automated mitigations.
6. **Predictive Incident Intelligence**: Machine learning model (Scikit-learn `RandomForestClassifier`, 89% accuracy) evaluating operational recurrence risks and recommending preventive engineering interventions.
7. **Unified Incident Management (USM)**: Full incident lifecycle (`New` → `Assigned` → `In Progress` → `Pending` → `Resolved` → `Closed`), SLA tracking, internal notes, and audit history.
8. **Service Request Management**: Internal operational requests with managerial approval and rejection workflows.
9. **Security, Strict RBAC & Account Governance**:
   - JWT Bearer authentication with password hashing (`bcrypt`), audit logging.
   - **Strict Ownership Checks**: Customers can only view and mutate their own complaints, requests, and notifications at the FastAPI endpoint level.
   - **Account Deactivation Governance**: Super Admins can deactivate user accounts with immediate revocation of login privileges and existing token validity (HTTP 403 Forbidden). Re-activating restores access immediately.
   - **6 Roles Supported**: Super Admin, Service Desk Agent, Banking Operations Manager, Technical Support Engineer, Operations Analyst, and User (Customer Portal).

---

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Recharts, Axios, Lucide React icons.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 (SQLite / PostgreSQL support), Passlib/Bcrypt, Python-Jose (JWT).
- **Generative AI & RAG**: Modular LLM abstraction (Grounded Enterprise Generator, Google Gemini, OpenAI, Anthropic), Vector Store with cosine similarity and grounded citation engine.
- **Machine Learning**: Python, Scikit-learn (`RandomForestClassifier`), Pandas, NumPy.
- **Testing**: Pytest (15 backend tests passed), Vitest & Testing Library (4 frontend tests passed).
- **DevOps**: Docker, Docker Compose, Nginx.

---

## Demo User Credentials

The application is pre-seeded with 6 role personas (5 enterprise roles + 1 customer portal role):

| Role | Username | Password | Department / Portal | Access Level |
|---|---|---|---|---|
| **Super Admin** | `admin` | `Admin@123` | Executive IT & Risk | Full governance, RBAC, user deactivation |
| **Banking Operations Manager** | `manager` | `Manager@123` | IT Service Management | Service health, P1 incidents, approvals |
| **Service Desk Agent** | `agent` | `Agent@123` | Retail Banking Operations | Frontline AI intake, triage, assignment |
| **Technical Support Engineer** | `tech` | `Tech@123` | Core Infrastructure & Switching | Root cause analysis, diagnostics, resolution |
| **Operations Analyst** | `analyst` | `Analyst@123` | Business Operations & SLA Analytics | Telemetry, ML predictions, audit logs |
| **User (Customer)** | `user` | `User@123` | Customer Self-Service Portal | Complaints, service requests, AI assistant |

*(Note: The top navigation bar includes an instant 1-click **Persona Switcher** to quickly test different roles without logging out).*

---

## Getting Started & Execution Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm (tested on Node v20/v26)

### 1. Backend Setup & Run

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database and seed sample data
python -m app.seed_data

# Start FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at `http://localhost:8000`.
- Health check: `http://localhost:8000/health`
- Swagger OpenAPI documentation: `http://localhost:8000/docs`

### 2. Frontend Setup & Run

In a separate terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## Running with Docker Compose

To run the complete stack with a single command:

```bash
docker-compose up --build
```

- Web Application: `http://localhost:5173`
- Backend API & Swagger: `http://localhost:8000/docs`

---

## Running Tests

### Backend Unit & Integration Tests (Pytest)
```bash
cd backend
./venv/bin/pytest -v tests/test_backend.py
```
*Result: 15/15 tests passed.*

### Frontend Component Tests (Vitest)
```bash
cd frontend
npm run test
```
*Result: 4/4 tests passed.*

---

## Demonstration Scenarios (Evaluation Guide)

1. **Scenario 1 (UPI Payment Failure)**: Open **AI Service Desk**, click the preset *"UPI payment of INR 4,299 debited for Flipkart..."*, and view the 7-agent trace, T+1 reversal guidance, and newly created incident ticket.
2. **Scenario 2 (ATM Dispense Jam)**: In AI Service Desk, submit *"I tried to withdraw INR 10,000 from ATM-MUM-402 Bandra..."*. The system flags sensor code `D-01` and retrieves the ATM cash balancing SOP.
3. **Scenario 3 (Mobile Banking SIM Binding)**: Submit *"Mobile banking app SIM binding failed on Android 14"*. Ticket routed to Digital Support with device security checklist.
4. **Scenario 4 (Duplicate Transaction & Manager Approval)**: Submit *"Charged twice for INR 89,900 for Apple Store"*. Exceeds ₹50,000 automated limit; triggers **Pending Human Approval** in **Workflow Management**. Switch to Service Manager to approve.
5. **Scenario 5 (Cross-Service Blast Radius)**: Open **Banking Operations**, select `Payment Gateway Service`, set state to `Complete Outage`, and click **Analyze Impact & Mitigations** to trace cascading failures on UPI and Card processing.
6. **Scenario 6 (Predictive ML Recurrence)**: Open **Predictive Intelligence** to inspect Random Forest evaluation metrics (Accuracy: 89%, Precision: 86%, Recall: 88%) and run risk assessments for any banking service.

---

## Project Structure

```
finassist-360/
├── backend/
│   ├── app/
│   │   ├── api/             # REST API route handlers
│   │   ├── core/            # Config, database engine, security & JWT
│   │   ├── models/          # SQLAlchemy relational data models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic layer
│   │   ├── agents/          # 7 specialized AI agents & central orchestrator
│   │   ├── rag/             # Vector store, chunking, and grounded search
│   │   ├── ml/              # Scikit-learn predictive model & dataset generator
│   │   ├── workflows/       # Visual workflow engine & definitions
│   │   ├── seed_data.py     # Database seeder with realistic banking data
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Backend Pytest suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Status badges, metric cards, agent pipeline viewer
│   │   ├── context/         # AuthContext & role switching
│   │   ├── layouts/         # Sidebar, Navbar, and MainLayout
│   │   ├── pages/           # 12 functional application pages
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
│   │   └── __tests__/       # Vitest component test suite
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── data/
│   ├── sample_documents/    # 5 standard banking SOP documents
│   └── synthetic_datasets/  # Historical incident training CSV
├── docs/                    # Architecture, API specs, AI agents guide, ML details
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## License

This project is licensed under the MIT License. Developed for enterprise banking service management research and evaluation.
