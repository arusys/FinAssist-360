# FinAssist 360 – Multi-Agent Orchestration & RAG Specification

## 1. Overview of Multi-Agent Architecture

FinAssist 360 does not rely on a monolithic chat prompt. Instead, it employs an orchestrated mesh of **7 specialized agents**, each with dedicated responsibilities, structured JSON schemas, and deterministic tools.

```
[ Customer Query ]
       │
       ▼
1. Customer Request Understanding Agent  ──▶ (Intent, Amount, RRN, Merchant, Sentiment)
       │
       ▼
2. Incident Classification Agent        ──▶ (Category, Priority P1-P4, SLA Hours, Department)
       │
       ▼
3. Transaction Analysis Agent           ──▶ (CBS Ledger Verification, NPCI Response Codes, Duplicate Check)
       │
       ▼
4. Knowledge Retrieval Agent (RAG)      ──▶ (Grounded SOP Search, SLA Directives, Section Citations)
       │
       ▼
5. Root Cause Analysis Agent            ──▶ (Dependency Blast Radius, Infrastructure Switch Reasoning)
       │
       ▼
6. Workflow Coordination Agent          ──▶ (Task Decomposition, High-Value Approval Enforcement)
       │
       ▼
7. Resolution Assistant Agent           ──▶ (Empathetic Response, Tracking ID, Troubleshooting Steps)
       │
       ▼
[ Automatic Incident Creation & DB Audit ]
```

---

## 2. Agent Responsibilities & Deterministic Guarantees

### Agent 1: Customer Request Understanding Agent
- **Role**: Intent Recognition & Entity Extraction.
- **Input**: Raw natural-language complaint.
- **Output**:
  - `intent`: (e.g. `PAYMENT_DEBIT_WITHOUT_CREDIT`, `ATM_DISPENSE_FAILURE`, `CARD_TRANSACTION_DECLINE`).
  - `affected_service_code`: (e.g. `UPI_PAYMENT`, `ATM_NETWORK`).
  - `extracted_entities`: Extracted numeric amount, 12-digit RRN reference, merchant name.
- **Safety**: Strips adversarial prompt injection attempts (`Ignore previous instructions`).

### Agent 2: Incident Classification Agent
- **Role**: Severity Assessment & Routing.
- **Rules**:
  - P1: Systemic outages or payment gateway disruptions.
  - P2: Individual financial debits > ₹25,000 or ATM dispenser sensor lockouts (4-hour SLA).
  - P3: Standard merchant settlement timeouts (24-hour SLA).
  - P4: Configuration or informational requests (48-hour SLA).

### Agent 3: Transaction Analysis Agent
- **Role**: Core Ledger Audit & Switch Code Analysis.
- **Deterministic Tool**: Queries `SyntheticTransaction` records by reference RRN or amount window.
- **Checks**:
  - Matches NPCI response codes (e.g., Code 91 = Switch Timeout).
  - Flags duplicate transaction records created within 60 seconds.

### Agent 4: Knowledge Retrieval Agent (RAG)
- **Role**: Grounded Policy Verification.
- **Deterministic Tool**: Queries vector store built from institutional SOPs.
- **Grounded Verification**: If the similarity score is below the threshold, it explicitly returns:
  > *"The knowledge base does not contain enough information regarding this request."*
  It never fabricates central bank policies or SLA compensations.

### Agent 5: Root Cause Analysis Agent
- **Role**: Dependency Blast Radius Reasoning.
- **Tool**: Traverses `service_dependencies` database table. Explains why a primary switch latency propagates to downstream customer channels.

### Agent 6: Workflow Coordination Agent
- **Role**: Task Generation & Approval Gatekeeper.
- **Safety Policy**: Automated execution is strictly restricted. Any manual fund reversal or refund exceeding **₹50,000** triggers a `PENDING` Approval record requiring human Service Manager review.

### Agent 7: Resolution Assistant Agent
- **Role**: Customer Communication & Closure Dossier.
- **Output**: Clear, jargon-free customer guidance containing the official incident tracking number, auto-reversal deadline, and troubleshooting steps.

---

## 3. RAG Grounding & Protection Against Hallucinations

1. **Chunking**: Documents chunked preserving standard operating procedure section headers.
2. **Vector Space**: Sublinear TF-IDF scaling with 1-gram and 2-gram domain token matrices.
3. **Citations**: All answers cite the exact document title, section name, and similarity match percentage.
