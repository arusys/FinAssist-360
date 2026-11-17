import os
import json
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.banking_service import BankingService, ServiceDependency
from app.models.incident import Incident, IncidentPriority, IncidentStatus, IncidentCategory, IncidentNote, IncidentHistory
from app.models.service_request import ServiceRequest, RequestStatus, RequestCategory
from app.models.transaction import SyntheticTransaction
from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.models.workflow import WorkflowDefinition, WorkflowExecution, WorkflowTask, Approval
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.prediction import IncidentPrediction
from app.rag.document_processor import DocumentProcessor
from app.rag.rag_service import RAGService
from app.workflows.definitions import STANDARD_WORKFLOWS
from app.workflows.engine import WorkflowEngine
from app.ml.predictive_model import global_predictor

def seed_database(db: Session) -> None:
    print("[Seed] Checking existing records...")
    if db.query(User).first():
        print("[Seed] Database already seeded. Skipping initial seed.")
        RAGService.reload_index_from_db(db)
        return

    print("[Seed] Creating demo users across 5 enterprise roles...")
    demo_users = [
        User(
            email="admin@finassist360.bank",
            username="admin",
            full_name="Sarah Jenkins (Super Admin & CTO)",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.SUPER_ADMIN,
            department="Executive IT & Risk"
        ),
        User(
            email="manager@finassist360.bank",
            username="manager",
            full_name="Vikram Mehta (Banking Operations Manager)",
            hashed_password=get_password_hash("Manager@123"),
            role=UserRole.BANKING_OPERATIONS_MANAGER,
            department="IT Service Management"
        ),
        User(
            email="agent@finassist360.bank",
            username="agent",
            full_name="Priya Sharma (Senior Service Desk Agent)",
            hashed_password=get_password_hash("Agent@123"),
            role=UserRole.SERVICE_DESK_AGENT,
            department="Retail Banking Operations"
        ),
        User(
            email="tech@finassist360.bank",
            username="tech",
            full_name="David Chen (Lead Technical Support Engineer)",
            hashed_password=get_password_hash("Tech@123"),
            role=UserRole.TECHNICAL_SUPPORT_ENGINEER,
            department="Core Infrastructure & Switching"
        ),
        User(
            email="analyst@finassist360.bank",
            username="analyst",
            full_name="Ananya Roy (Principal Operations Analyst)",
            hashed_password=get_password_hash("Analyst@123"),
            role=UserRole.OPERATIONS_ANALYST,
            department="Business Operations & SLA Analytics"
        ),
        User(
            email="customer@finassist360.bank",
            username="user",
            full_name="Alex Turner (Retail Banking Customer)",
            hashed_password=get_password_hash("User@123"),
            role=UserRole.USER,
            department="Retail Customer Services"
        )
    ]
    db.add_all(demo_users)
    db.flush()

    print("[Seed] Creating 7 core banking services...")
    services_data = [
        {
            "name": "Payment Gateway Service",
            "code": "PAYMENT_GATEWAY",
            "category": "Interchange & Settlement",
            "description": "High-throughput acquiring switch routing merchant card and UPI transactions.",
            "status": "Operational",
            "availability": 99.98,
            "current_incident_count": 2,
            "affected_requests_count": 4,
            "sla_threshold": 99.95
        },
        {
            "name": "UPI Payment Service",
            "code": "UPI_PAYMENT",
            "category": "Retail Immediate Payments",
            "description": "National Unified Payments Interface real-time settlement engine.",
            "status": "Degraded",
            "availability": 99.45,
            "current_incident_count": 5,
            "affected_requests_count": 18,
            "sla_threshold": 99.90
        },
        {
            "name": "NEFT/RTGS Payment Service",
            "code": "NEFT_RTGS",
            "category": "Inter-Bank Wholesale Payments",
            "description": "Batch and real-time gross settlement clearing gateway with Central Bank.",
            "status": "Operational",
            "availability": 99.99,
            "current_incident_count": 0,
            "affected_requests_count": 0,
            "sla_threshold": 99.95
        },
        {
            "name": "ATM Network Service",
            "code": "ATM_NETWORK",
            "category": "Physical Terminal Infrastructure",
            "description": "Central switch controller monitoring 1,850+ ATM cash dispensers and sensors.",
            "status": "Operational",
            "availability": 99.82,
            "current_incident_count": 3,
            "affected_requests_count": 7,
            "sla_threshold": 99.85
        },
        {
            "name": "Mobile Banking Service",
            "code": "MOBILE_BANKING",
            "category": "Digital Customer Channels",
            "description": "iOS and Android secure digital banking microservices and token auth.",
            "status": "Operational",
            "availability": 99.91,
            "current_incident_count": 1,
            "affected_requests_count": 3,
            "sla_threshold": 99.90
        },
        {
            "name": "Internet Banking Service",
            "code": "INTERNET_BANKING",
            "category": "Digital Customer Channels",
            "description": "Web client portal with 2FA, OTP verification, and corporate transaction suites.",
            "status": "Operational",
            "availability": 99.96,
            "current_incident_count": 1,
            "affected_requests_count": 2,
            "sla_threshold": 99.90
        },
        {
            "name": "Card Processing Service",
            "code": "CARD_PROCESSING",
            "category": "Card Schemes & Switching",
            "description": "Debit and credit card authorization engine supporting Visa, Mastercard, and RuPay.",
            "status": "Operational",
            "availability": 99.94,
            "current_incident_count": 2,
            "affected_requests_count": 5,
            "sla_threshold": 99.90
        }
    ]

    service_objs = {}
    for s_item in services_data:
        obj = BankingService(**s_item)
        db.add(obj)
        db.flush()
        service_objs[obj.code] = obj

    print("[Seed] Creating 11 service dependencies for Cross-Service Impact topology...")
    deps_data = [
        ("UPI_PAYMENT", "PAYMENT_GATEWAY", "Hard Dependency", "Critical", "UPI transaction settlements rely on Gateway tunnel."),
        ("CARD_PROCESSING", "PAYMENT_GATEWAY", "Hard Dependency", "Critical", "Card e-commerce authorizer relies on Payment Gateway."),
        ("MOBILE_BANKING", "UPI_PAYMENT", "Soft Dependency", "High", "Mobile app features embedded UPI fund transfer module."),
        ("MOBILE_BANKING", "CARD_PROCESSING", "Soft Dependency", "Medium", "Card controls and limits managed in Mobile Banking."),
        ("INTERNET_BANKING", "NEFT_RTGS", "Hard Dependency", "High", "NetBanking fund transfers route through NEFT/RTGS switch."),
        ("INTERNET_BANKING", "PAYMENT_GATEWAY", "Hard Dependency", "Critical", "Online merchant checkout uses payment gateway."),
        ("ATM_NETWORK", "CARD_PROCESSING", "Hard Dependency", "Critical", "ATM transactions require card pin verification & issuer switch."),
        ("ATM_NETWORK", "NEFT_RTGS", "Soft Dependency", "Low", "ATM end-of-day cash settlement."),
        ("MOBILE_BANKING", "INTERNET_BANKING", "Soft Dependency", "Medium", "Shared identity provider and OAuth token service."),
        ("CARD_PROCESSING", "UPI_PAYMENT", "Failover", "Medium", "Fallback payment option during merchant card declines."),
        ("PAYMENT_GATEWAY", "NEFT_RTGS", "Soft Dependency", "High", "Merchant payout batches executed via NEFT settlement.")
    ]

    for src_code, tgt_code, dep_type, crit, desc in deps_data:
        if src_code in service_objs and tgt_code in service_objs:
            dep = ServiceDependency(
                source_service_id=service_objs[src_code].id,
                target_service_id=service_objs[tgt_code].id,
                dependency_type=dep_type,
                criticality=crit,
                description=desc
            )
            db.add(dep)
    db.flush()

    print("[Seed] Ingesting 5 sample banking knowledge documents into RAG knowledge base...")
    sample_docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "data", "sample_documents")
    doc_meta = [
        ("payment_dispute_resolution_sop.txt", "Payment Processing Procedures & T+1 SLA SOP", "Payment processing procedures"),
        ("atm_hardware_network_troubleshooting.txt", "ATM Network & Cash Dispenser Troubleshooting Manual", "ATM troubleshooting"),
        ("card_declines_and_fraud_prevention_guide.txt", "Card Declines, Chargeback and Fraud Prevention Guidelines", "Debit and credit card support"),
        ("mobile_internet_banking_auth_policy.txt", "Mobile Banking SIM Binding & Auth Security Policy", "Mobile and Internet banking issues"),
        ("core_banking_service_level_agreements.txt", "Enterprise Core Banking SLA Matrix & Escalation Protocol", "Service-level agreements")
    ]

    for fname, title, category in doc_meta:
        fpath = os.path.join(sample_docs_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                content_bytes = f.read()
            text = DocumentProcessor.extract_text(content_bytes, fname)
            chunks = DocumentProcessor.chunk_document(text)

            kdoc = KnowledgeDocument(
                title=title,
                category=category,
                filename=fname,
                file_type="txt",
                file_size_bytes=len(content_bytes),
                total_chunks=len(chunks),
                uploaded_by="System Knowledge Administrator"
            )
            db.add(kdoc)
            db.flush()

            for idx, c in enumerate(chunks):
                chunk_obj = DocumentChunk(
                    document_id=kdoc.id,
                    chunk_index=idx,
                    content=c["content"],
                    section_name=c.get("section_name", "General")
                )
                db.add(chunk_obj)
    db.flush()

    # Initialize Vector store
    RAGService.reload_index_from_db(db)

    print("[Seed] Creating synthetic transaction records...")
    txns = [
        SyntheticTransaction(
            txn_id="TXN-UPI-984021",
            account_mask="XXXX-XXXX-4921",
            service_code="UPI_PAYMENT",
            merchant_name="Flipkart India Online",
            amount=4299.00,
            status="TIMEOUT_FAILED",
            failure_reason="NPCI Switch Socket Timeout (Response code 91)",
            terminal_id="POS-BLR-892",
            reference_rrn="RRN9928340192",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=2)
        ),
        SyntheticTransaction(
            txn_id="TXN-UPI-984022",
            account_mask="XXXX-XXXX-4921",
            service_code="UPI_PAYMENT",
            merchant_name="Flipkart India Online",
            amount=4299.00,
            status="DUPLICATE_SUSPECT",
            failure_reason="Duplicate sequence ID detected within 45 seconds",
            terminal_id="POS-BLR-892",
            reference_rrn="RRN9928340192",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=2, minutes=1)
        ),
        SyntheticTransaction(
            txn_id="TXN-ATM-104928",
            account_mask="XXXX-XXXX-8812",
            service_code="ATM_NETWORK",
            merchant_name="SBI ATM Bandra West",
            amount=10000.00,
            status="FAILED",
            failure_reason="CDM Dispenser transport jam sensor triggered (Code D-01)",
            terminal_id="ATM-MUM-402",
            reference_rrn="RRN8829103941",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=5)
        ),
        SyntheticTransaction(
            txn_id="TXN-CRD-772910",
            account_mask="XXXX-XXXX-3341",
            service_code="CARD_PROCESSING",
            merchant_name="Starbucks Mumbai Airport",
            amount=780.00,
            status="SUCCESS",
            terminal_id="POS-MUM-110",
            reference_rrn="RRN7710293841",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=1)
        ),
        SyntheticTransaction(
            txn_id="TXN-CRD-772911",
            account_mask="XXXX-XXXX-1102",
            service_code="CARD_PROCESSING",
            merchant_name="Apple Store Online",
            amount=89900.00,
            status="FAILED",
            failure_reason="Issuer Risk Engine Velocity Decline (Code 05)",
            terminal_id="ECOMM-DEL-01",
            reference_rrn="RRN6620192831",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=3)
        ),
        SyntheticTransaction(
            txn_id="TXN-NET-551029",
            account_mask="XXXX-XXXX-9901",
            service_code="NEFT_RTGS",
            merchant_name="Apex Global Vendor Solutions",
            amount=250000.00,
            status="SUCCESS",
            reference_rrn="RRN5510293810",
            timestamp=datetime.now(timezone.utc) - timedelta(hours=8)
        )
    ]
    db.add_all(txns)
    db.flush()

    print("[Seed] Creating 32 historical and active incidents...")
    now = datetime.now(timezone.utc)
    incidents_data = [
        # Active Critical Incident
        {
            "num": "INC-2025-00101",
            "title": "Payment Gateway Switch Intermittent Latency on Merchant QR Settlements",
            "desc": "Acquiring gateway experiencing elevated timeout rates on merchant payments during peak morning transaction window.",
            "cat": IncidentCategory.BANKING_INFRASTRUCTURE,
            "pri": IncidentPriority.P1,
            "stat": IncidentStatus.IN_PROGRESS,
            "serv": "PAYMENT_GATEWAY",
            "dept": "Core Infrastructure & Switching",
            "user_id": demo_users[3].id,
            "rep": "Automated Synthetic Probe",
            "ai": True,
            "conf": "96%",
            "rc": "Database connection pool exhaustion on payment switch secondary node.",
            "sla": now + timedelta(hours=1),
            "created": now - timedelta(hours=1, minutes=20)
        },
        # Active High Incident
        {
            "num": "INC-2025-00102",
            "title": "Customer UPI Debit without Merchant Confirmation (INR 4,299.00)",
            "desc": "Customer account debited at Flipkart checkout; merchant order status marked unfulfilled. RRN: RRN9928340192.",
            "cat": IncidentCategory.PAYMENT_FAILURE,
            "pri": IncidentPriority.P2,
            "stat": IncidentStatus.ASSIGNED,
            "serv": "UPI_PAYMENT",
            "dept": "Retail Payments & Settlements",
            "user_id": demo_users[2].id,
            "rep": "Customer Care Portal (CUST-98321)",
            "ai": True,
            "conf": "94%",
            "rc": "NPCI switch socket timeout during transaction transit.",
            "sla": now + timedelta(hours=3),
            "created": now - timedelta(hours=2)
        },
        # ATM Failure
        {
            "num": "INC-2025-00103",
            "title": "ATM-MUM-402 Bandra Cash Dispenser Shutter Lockout",
            "desc": "Terminal CDM error code D-01 reported. Account debited for INR 10,000 without cash dispensation.",
            "cat": IncidentCategory.ATM_FAILURE,
            "pri": IncidentPriority.P2,
            "stat": IncidentStatus.IN_PROGRESS,
            "serv": "ATM_NETWORK",
            "dept": "ATM Operations & Field Maintenance",
            "user_id": demo_users[3].id,
            "rep": "ATM Diagnostic Sensor",
            "ai": True,
            "conf": "92%",
            "rc": "Reject cassette sensor divert failure.",
            "sla": now + timedelta(hours=2),
            "created": now - timedelta(hours=4)
        },
        # Mobile Banking
        {
            "num": "INC-2025-00104",
            "title": "Mobile Banking Android Build 4.2.1 SIM Binding Failure",
            "desc": "Multiple retail customers unable to complete device registration on Android 14 devices after recent security patch.",
            "cat": IncidentCategory.MOBILE_BANKING,
            "pri": IncidentPriority.P2,
            "stat": IncidentStatus.NEW,
            "serv": "MOBILE_BANKING",
            "dept": "Digital Banking Technical Support",
            "rep": "Customer Portal",
            "ai": False,
            "sla": now + timedelta(hours=4),
            "created": now - timedelta(hours=3)
        },
        # High value dispute needing approval
        {
            "num": "INC-2025-00105",
            "title": "High-Value Transaction Duplicate Charge Dispute (INR 89,900.00)",
            "desc": "Double debit recorded on premium credit card for Apple Store purchase. Customer requesting urgent reversal.",
            "cat": IncidentCategory.TRANSACTION_DISPUTES,
            "pri": IncidentPriority.P2,
            "stat": IncidentStatus.PENDING,
            "serv": "CARD_PROCESSING",
            "dept": "Retail Payments & Settlements",
            "user_id": demo_users[1].id,
            "rep": "Customer Phone Banking",
            "ai": True,
            "conf": "95%",
            "rc": "Acquiring gateway duplicate sequence token generation.",
            "sla": now + timedelta(hours=6),
            "created": now - timedelta(hours=5)
        }
    ]

    # Add 27 historical resolved incidents
    past_categories = [
        IncidentCategory.PAYMENT_FAILURE,
        IncidentCategory.ATM_FAILURE,
        IncidentCategory.CARD_ISSUES,
        IncidentCategory.INTERNET_BANKING,
        IncidentCategory.ACCOUNT_ACCESS,
        IncidentCategory.TRANSACTION_DISPUTES,
        IncidentCategory.SECURITY_ALERTS
    ]
    past_services = ["UPI_PAYMENT", "ATM_NETWORK", "CARD_PROCESSING", "MOBILE_BANKING", "INTERNET_BANKING", "PAYMENT_GATEWAY"]

    for i in range(1, 28):
        c = past_categories[i % len(past_categories)]
        s_code = past_services[i % len(past_services)]
        p = IncidentPriority.P3 if i % 3 != 0 else IncidentPriority.P2
        created_time = now - timedelta(days=(i // 4) + 1, hours=(i * 3) % 24)
        resolved_time = created_time + timedelta(hours=2 if p == IncidentPriority.P2 else 6)

        incidents_data.append({
            "num": f"INC-2025-00{105 + i}",
            "title": f"Historical {c.value} Investigation #{100 + i}",
            "desc": f"Automated resolution and ledger verification completed for historical incident #{100 + i}.",
            "cat": c,
            "pri": p,
            "stat": IncidentStatus.RESOLVED if i % 2 == 0 else IncidentStatus.CLOSED,
            "serv": s_code,
            "dept": "Retail Banking Operations",
            "user_id": demo_users[2].id,
            "rep": "Customer Care Portal",
            "ai": True,
            "conf": "91%",
            "rc": "Transient upstream gateway timeout; auto-reversal verified.",
            "res_notes": "Account credited within T+1 SLA. Customer confirmed ledger balance.",
            "sla": created_time + timedelta(hours=24),
            "created": created_time,
            "resolved": resolved_time
        })

    created_inc_objs = []
    for inc_raw in incidents_data:
        inc = Incident(
            incident_number=inc_raw["num"],
            title=inc_raw["title"],
            description=inc_raw["desc"],
            category=inc_raw["cat"],
            priority=inc_raw["pri"],
            status=inc_raw["stat"],
            service_id=service_objs[inc_raw["serv"]].id if inc_raw["serv"] in service_objs else None,
            assigned_department=inc_raw["dept"],
            assigned_to_id=inc_raw.get("user_id"),
            reported_by=inc_raw["rep"],
            customer_identifier="CUST-98321",
            ai_generated=inc_raw.get("ai", False),
            ai_confidence=inc_raw.get("conf"),
            root_cause=inc_raw.get("rc"),
            investigation_summary="Multi-agent automated investigation completed.",
            resolution_notes=inc_raw.get("res_notes"),
            sla_due_at=inc_raw.get("sla"),
            resolved_at=inc_raw.get("resolved"),
            created_at=inc_raw["created"],
            updated_at=inc_raw["created"]
        )
        db.add(inc)
        db.flush()
        created_inc_objs.append(inc)

        # Add history
        hist = IncidentHistory(
            incident_id=inc.id,
            changed_by="System Initializer",
            old_status=None,
            new_status=inc.status.value,
            action="INCIDENT_RECORD_CREATED",
            details=f"Record initialized with status {inc.status.value}",
            created_at=inc.created_at
        )
        db.add(hist)

    print("[Seed] Creating 16 service operational requests...")
    req_templates = [
        ("Employee Access Request - Core Banking System", "Grant read/write access to Finacle CBS for new support trainee.", RequestCategory.EMPLOYEE_ACCESS, "High", RequestStatus.UNDER_REVIEW),
        ("Banking Application Access - Anti-Money Laundering Portal", "Requesting tier-2 compliance investigator role in AML monitoring engine.", RequestCategory.BANKING_APP_ACCESS, "Medium", RequestStatus.APPROVED),
        ("Software Installation - Fortinet VPN Client", "Developer laptop configuration for remote on-call network access.", RequestCategory.SOFTWARE_INSTALLATION, "Low", RequestStatus.FULFILLED),
        ("Password Reset Request - Active Directory Admin Console", "Password expired during emergency maintenance window; reset token needed.", RequestCategory.PASSWORD_RESET, "High", RequestStatus.FULFILLED),
        ("Hardware Support - PinPad Replacement at Branch 104", "Encrypted PIN pad serial mismatch at Connaught Place branch teller counter.", RequestCategory.HARDWARE_SUPPORT, "High", RequestStatus.IN_PROGRESS),
        ("New Employee Onboarding - Risk & Compliance Analyst", "Provision email, SSO credentials, and secure workstation for new hire.", RequestCategory.ONBOARDING, "Medium", RequestStatus.SUBMITTED),
        ("Departmental Service Request - Quarter-End Ledger Audit Export", "Generate encrypted CSV report of all inter-bank RTGS clearing settlements.", RequestCategory.DEPARTMENTAL_SERVICE, "Medium", RequestStatus.APPROVED),
        ("Employee Access - Card Management Console", "Access to unblock debit cards for retail customer care supervisor.", RequestCategory.EMPLOYEE_ACCESS, "Medium", RequestStatus.SUBMITTED),
        ("Software Installation - Wireshark for Network Diagnostics", "Network team packet capture tool approval on testbed workstation.", RequestCategory.SOFTWARE_INSTALLATION, "Low", RequestStatus.FULFILLED),
        ("Hardware Support - Receipt Printer Drum Jam", "Teller printer jamming on thermal transaction receipts at Andheri branch.", RequestCategory.HARDWARE_SUPPORT, "Low", RequestStatus.SUBMITTED),
        ("Password Reset - Database Read Replica Access", "Rotated database credentials for reporting dashboard sync.", RequestCategory.PASSWORD_RESET, "Medium", RequestStatus.FULFILLED),
        ("New Employee Onboarding - Junior Software Tester", "Workspace access and Git repository permissions for quality engineering.", RequestCategory.ONBOARDING, "Medium", RequestStatus.APPROVED),
        ("Departmental Service - Bulk SMS Gateway Quota Extension", "Double transaction OTP SMS throughput for upcoming festival shopping weekend.", RequestCategory.DEPARTMENTAL_SERVICE, "High", RequestStatus.APPROVED),
        ("Banking Application Access - Swift Gateway Monitor", "Access to view international cross-border MT103 wire messages.", RequestCategory.BANKING_APP_ACCESS, "High", RequestStatus.UNDER_REVIEW),
        ("Hardware Support - Dual Monitor Setup for Operations Center", "Operations command room display setup for real-time incident wall.", RequestCategory.HARDWARE_SUPPORT, "Low", RequestStatus.SUBMITTED),
        ("Employee Access - Dispute Clearing Chargeback Portal", "Dispute officer access to submit Visa VROL chargeback claims.", RequestCategory.EMPLOYEE_ACCESS, "High", RequestStatus.APPROVED)
    ]

    for idx, (title, desc, cat, pri, stat) in enumerate(req_templates):
        sreq = ServiceRequest(
            request_number=f"REQ-2025-00{201 + idx}",
            title=title,
            description=desc,
            category=cat,
            priority=pri,
            status=stat,
            requester_name=f"Staff Member {idx + 1}",
            requester_email=f"staff{idx + 1}@finassist360.bank",
            department="Retail & Technical Operations",
            requires_approval=True,
            approved_by="Vikram Mehta (Service Manager)" if stat in [RequestStatus.APPROVED, RequestStatus.FULFILLED] else None,
            created_at=now - timedelta(days=idx // 3, hours=idx * 2)
        )
        db.add(sreq)
    db.flush()

    print("[Seed] Initializing standard workflows and approvals...")
    WorkflowEngine.initialize_definitions(db)

    # Create active approval request for high value incident INC-2025-00105
    inc_105 = created_inc_objs[4]
    approval = Approval(
        entity_type="Incident",
        entity_id=inc_105.id,
        entity_ref=inc_105.incident_number,
        action_requested="MANUAL_REVERSAL_HIGH_VALUE",
        description=f"Manual credit reversal authorization required for INR 89,900.00 exceeding automated threshold for incident {inc_105.incident_number}.",
        required_role="Service Manager",
        status="PENDING",
        created_at=now - timedelta(hours=2)
    )
    db.add(approval)

    print("[Seed] Seeding notifications and audit logs...")
    notifs = [
        Notification(
            title="P1 Critical Alert: Payment Gateway Latency",
            message="Payment Gateway Switch latency exceeded 1200ms. 4 dependent services at risk.",
            notification_type="CRITICAL_ALERT",
            entity_type="Incident",
            entity_id=str(created_inc_objs[0].id)
        ),
        Notification(
            title="Approval Required: High-Value Reversal",
            message="Incident INC-2025-00105 requires Service Manager approval for INR 89,900.00 reversal.",
            notification_type="APPROVAL_PENDING",
            entity_type="Incident",
            entity_id=str(created_inc_objs[4].id)
        ),
        Notification(
            title="SLA Warning: ATM-MUM-402 Hardware Dispatch",
            message="ATM Cash Dispenser incident approaching 4-hour SLA deadline in 45 minutes.",
            notification_type="SLA_WARNING",
            entity_type="Incident",
            entity_id=str(created_inc_objs[2].id)
        )
    ]
    db.add_all(notifs)

    # Initial Audit Logs
    audits = [
        AuditLog(username="system", user_role="System", action="SYSTEM_BOOTSTRAP", entity_type="System", details="FinAssist 360 platform successfully initialized."),
        AuditLog(username="Sarah Jenkins", user_role="Admin", action="USER_LOGIN", entity_type="User", details="Admin login from secure bastion workstation."),
        AuditLog(username="Vikram Mehta", user_role="Service Manager", action="POLICY_UPDATE", entity_type="KnowledgeDocument", details="Verified T+1 settlement compensation directive.")
    ]
    db.add_all(audits)

    print("[Seed] Training ML predictive model and generating failure recurrence predictions...")
    global_predictor.train_model()

    # Pre-populate predictive risks for banking services
    pred_services = [
        ("Payment Gateway Service", 0.78, "Critical", 3.2, "Elevated TCP switch handshake timeout under peak concurency"),
        ("UPI Payment Service", 0.65, "High", 4.5, "Transient socket resets during batch reconciliation windows"),
        ("ATM Network Service", 0.42, "Medium", 8.0, "Cassette transport belt wear in metro branch terminals"),
        ("Card Processing Service", 0.28, "Medium", 14.0, "Occasional issuer fraud velocity declines on cross-border transactions")
    ]

    for s_name, score, lvl, freq, driver in pred_services:
        s_obj = db.query(BankingService).filter(BankingService.name == s_name).first()
        pred = IncidentPrediction(
            service_id=s_obj.id if s_obj else None,
            service_name=s_name,
            recurrence_risk_score=score,
            risk_level=lvl,
            predicted_frequency_days=freq,
            primary_failure_driver=driver,
            recommended_preventive_actions=(
                "1. Increase gateway worker threads and socket buffer limits.\n"
                "2. Conduct scheduled failover drill to secondary link.\n"
                "3. Configure proactive circuit breaker alerting at 400ms threshold."
            ),
            confidence_score=0.89
        )
        db.add(pred)

    db.commit()
    print("[Seed] Database seeding completed successfully!")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
