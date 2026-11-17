import json
from typing import List, Dict, Any

STANDARD_WORKFLOWS: List[Dict[str, Any]] = [
    {
        "code": "WF_PAYMENT_FAILURE",
        "name": "Payment Failure & Dispute Resolution Workflow",
        "category": "Retail Payments",
        "description": "End-to-end incident investigation, automated T+1 auto-reversal audit, high-value approval, and merchant dispute resolution.",
        "stages": [
            "Customer Complaint Intake",
            "AI Intent & Entity Classification",
            "Core Ledger & NPCI Switch Verification",
            "RAG Knowledge Base & SLA Retrieval",
            "Incident Creation & Ticket Assignment",
            "Managerial Approval Gate",
            "Reversal Execution / Chargeback Dispatch",
            "Customer Closure Notification"
        ]
    },
    {
        "code": "WF_ATM_FAILURE",
        "name": "ATM Network Disruption & Field Maintenance Workflow",
        "category": "ATM Infrastructure",
        "description": "Hardware sensor alert diagnostics, supervisor mode isolation, maintenance engineer dispatch, cash balancing reconciliation.",
        "stages": [
            "ATM Sensor Alert Intake",
            "Severity Assessment & Terminal Locking",
            "Field Maintenance Dispatch",
            "Hardware Component & Cassette Inspection",
            "Cash Balancing Audit",
            "Supervisory Reset & Certification",
            "Incident Closure"
        ]
    },
    {
        "code": "WF_CARD_DISPUTE",
        "name": "Card Fraud & Chargeback Dispute Workflow",
        "category": "Card Services",
        "description": "Card lock authorization, cardholder dispute intake, Visa/Mastercard network representation, temporary credit issuance.",
        "stages": [
            "Dispute Declaration Submitted",
            "Fraud Risk Scoring & Velocity Check",
            "Card Number Lockdown & Virtual Reissue",
            "Interchange Chargeback Filing",
            "Service Manager Provisional Credit Approval",
            "Final Merchant Settlement",
            "Dispute Closed"
        ]
    }
]
