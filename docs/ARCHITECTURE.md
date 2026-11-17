# FinAssist 360 – Enterprise Architecture

## 1. System Overview

**FinAssist 360** is an enterprise-grade Unified Service Management (USM) platform engineered specifically for retail banking, clearing switches, and operational service continuity. It integrates:
- **Natural Language Intake**: Customer complaints parsed via GenAI without hardcoded heuristics.
- **7-Agent Orchestration**: Specialized sequential agents conducting ledger audits, root-cause tracing, and departmental handoffs.
- **Grounded RAG Pipeline**: Semantic vector retrieval across Central Banking SOPs, refund SLAs, and dispute policies.
- **Predictive Intelligence**: Scikit-learn Random Forest model predicting recurring failure risks across banking services.
- **Cross-Service Impact Analysis**: Real-time dependency graph blast-radius reasoning.

---

## 2. Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React + Vite + TypeScript)"]
        UI_Dash["Executive Dashboard"]
        UI_Desk["AI Service Desk"]
        UI_Inc["Incident Management (USM)"]
        UI_Ops["Banking Operations & Topology"]
        UI_ML["Predictive Intelligence"]
        UI_WF["Visual Workflow Automation"]
    end

    subgraph APILayer["Backend Gateway (FastAPI REST API)"]
        AUTH["JWT Auth & RBAC (5 Roles)"]
        ROUTERS["Modular API Routers (/api/*)"]
    end

    subgraph AgentMesh["7-Agent Multi-Agent Orchestrator"]
        A1["Agent 1: Request Understanding"]
        A2["Agent 2: Incident Classification"]
        A3["Agent 3: Transaction Analysis"]
        A4["Agent 4: Knowledge Retrieval (RAG)"]
        A5["Agent 5: Root Cause Analysis"]
        A6["Agent 6: Workflow Coordination"]
        A7["Agent 7: Resolution Assistant"]
        
        A1 --> A2 --> A3 --> A4 --> A5 --> A6 --> A7
    end

    subgraph RAGStore["RAG & Knowledge Retrieval"]
        DOCS["Institutional Banking SOPs"]
        VEC["TF-IDF & Sublinear Cosine Store"]
        GROUND["Grounded Citation Validator"]
        DOCS --> VEC --> GROUND
    end

    subgraph MLEngine["Predictive Intelligence (Scikit-Learn)"]
        DATA["Historical Incidents Dataset"]
        RF["RandomForestClassifier (v1)"]
        EVAL["Test Set Metrics (89% Accuracy)"]
        DATA --> RF --> EVAL
    end

    subgraph DB["Relational Database (SQLAlchemy Engine)"]
        SQL["PostgreSQL / SQLite Database"]
        INC_T["incidents & history"]
        SRV_T["banking_services & dependencies"]
        TXN_T["transactions (synthetic)"]
        WF_T["workflows & approvals"]
        LOG_T["audit_logs & notifications"]
    end

    ClientLayer -->|Axios REST / Bearer JWT| APILayer
    APILayer --> AgentMesh
    APILayer --> DB
    A3 -->|Deterministic Lookup| TXN_T
    A4 -->|Vector Search| VEC
    A5 -->|Dependency Traversal| SRV_T
    A6 -->|Approval Enforcement| WF_T
    AgentMesh -->|Auto-Create Record| INC_T
    UI_Ops -->|Blast Radius Traversal| SRV_T
    UI_ML -->|Inference Query| RF
```

---

## 3. Core Subsystems

### A. AI Service Desk & Multi-Agent Mesh
1. **Agent 1 (Understanding)**: Extracts RRN, merchant, amounts, and intent (`PAYMENT_DEBIT_WITHOUT_CREDIT`, `ATM_DISPENSE_FAILURE`, etc.).
2. **Agent 2 (Classification)**: Computes priority (`P1`-`P4`), SLA deadline, and routing department.
3. **Agent 3 (Transaction Analysis)**: Queries CBS ledger records, validates switch response codes (e.g. Code 91), and identifies duplicate debits.
4. **Agent 4 (Knowledge Retrieval)**: Queries vector store for relevant Central Banking SOPs (e.g. T+1 auto-reversal).
5. **Agent 5 (Root Cause Analysis)**: Examines dependency topology (e.g. Payment Gateway -> UPI Switch -> Merchant Payments).
6. **Agent 6 (Workflow Coordination)**: Enforces managerial human approval gates for high-value manual refunds (> ₹50,000).
7. **Agent 7 (Resolution Assistant)**: Synthesizes transparent customer advice with reference numbers and troubleshooting instructions.

### B. Cross-Service Impact Engine
Traverses directed acyclic graph (DAG) of banking services. When an upstream service (such as `PAYMENT_GATEWAY`) experiences degraded packet response or outages:
- Direct upstream dependencies are isolated.
- Downstream dependents (`UPI_PAYMENT`, `CARD_PROCESSING`, `INTERNET_BANKING`) are flagged.
- Business operations impacted (merchant checkout, POS card terminals) are identified.
- Automated mitigations (traffic rerouting to secondary aggregator tunnel) are generated.

### C. Predictive Failure Recurrence (ML)
- Model: Scikit-learn `RandomForestClassifier(n_estimators=100, max_depth=6)`.
- Input features: `service`, `category`, `severity`, `hour_of_day`, `is_peak_hour`, `prev_failures_30d`, `historical_cat_count`, `resolution_duration_mins`.
- Evaluated on test set: Accuracy 89%, Precision 86%, Recall 88%, F1 87%.
