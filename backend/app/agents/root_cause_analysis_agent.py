from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class RootCauseAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Root Cause Analysis Agent",
            role="Cross-Service Dependency Tracing & Failure Causality Reasoning"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        req_info = state.get("customer_request", {})
        txn_info = state.get("transaction_analysis", {})
        intent = req_info.get("intent", "")
        service_name = req_info.get("service_name", "UPI Payment Service")
        failure_reason = txn_info.get("detected_failure_reason", "Gateway timeout")

        if "UPI" in service_name or "Payment" in service_name:
            dependency_chain = [
                "Payment Gateway Service (Upstream)",
                "UPI Payment Switch (Direct Host)",
                "NPCI Clearing Network (External Switch)",
                "Beneficiary Core Banking (Downstream)"
            ]
            probable_cause = f"Transient TCP handshake timeout on NPCI Switch during high concurrency peak: {failure_reason}."
            confidence = 0.91
            impact_scope = "Broadly isolated to inter-bank UPI merchant settlement packets."
        elif "ATM" in service_name:
            dependency_chain = [
                "ATM Host Controller",
                "Encrypted PIN Pad & Cash Dispenser Module",
                "Core Banking Switch"
            ]
            probable_cause = "Cash dispenser shutter sensor timing jitter or physical bill rejection divert."
            confidence = 0.88
            impact_scope = "Single ATM Terminal (Physical Hardware Subsystem)."
        elif "Card" in service_name:
            dependency_chain = [
                "POS / E-commerce Acquiring Gateway",
                "Visa/Mastercard Interchange",
                "Issuer Risk & Fraud Engine"
            ]
            probable_cause = "Issuer risk engine threshold triggered or international transaction toggle disabled."
            confidence = 0.89
            impact_scope = "Account / Card Level Security Restriction."
        else:
            dependency_chain = [
                "API Gateway & Load Balancer",
                "OAuth2 Token Microservice",
                "Core Database Replica"
            ]
            probable_cause = "Session token expiration or mobile app integrity signature verification mismatch."
            confidence = 0.85
            impact_scope = "Customer Client Application / Device Session."

        return {
            "root_cause_summary": probable_cause,
            "dependency_chain_analyzed": dependency_chain,
            "confidence_level": confidence,
            "impact_scope": impact_scope,
            "systemic_failure_risk": "MODERATE" if "Gateway" in probable_cause else "LOW"
        }
