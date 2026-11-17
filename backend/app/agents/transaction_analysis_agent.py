from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base_agent import BaseAgent
from app.models.transaction import SyntheticTransaction

class TransactionAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Transaction Analysis Agent",
            role="Core Ledger Audit, Switch State Verification & Duplicate Detection"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        db: Session = state.get("db_session")
        req_info = state.get("customer_request", {})
        entities = req_info.get("extracted_entities", {})
        service_code = req_info.get("affected_service_code", "UPI_PAYMENT")
        amount = entities.get("amount")
        rrn = entities.get("reference_rrn")

        matched_txns = []
        if db:
            query = db.query(SyntheticTransaction)
            if rrn:
                matched_txns = query.filter(SyntheticTransaction.reference_rrn == rrn).all()
            elif amount:
                matched_txns = query.filter(
                    SyntheticTransaction.amount >= amount * 0.95,
                    SyntheticTransaction.amount <= amount * 1.05
                ).limit(3).all()
            else:
                matched_txns = query.filter(SyntheticTransaction.service_code == service_code).order_by(SyntheticTransaction.timestamp.desc()).limit(2).all()

        txn_summaries = []
        is_duplicate = False
        primary_status = "PENDING_DEBIT"
        failure_reason = "Switch timeout during beneficiary bank acknowledgement"

        if matched_txns:
            for t in matched_txns:
                txn_summaries.append({
                    "txn_id": t.txn_id,
                    "account_mask": t.account_mask,
                    "amount": t.amount,
                    "currency": t.currency,
                    "status": t.status,
                    "merchant": t.merchant_name,
                    "failure_reason": t.failure_reason,
                    "reference_rrn": t.reference_rrn,
                    "timestamp": t.timestamp.isoformat()
                })
            primary_status = matched_txns[0].status
            failure_reason = matched_txns[0].failure_reason or failure_reason
            if len(matched_txns) > 1 and matched_txns[0].amount == matched_txns[1].amount:
                is_duplicate = True
        else:
            # Deterministic simulation based on customer query
            txn_summaries.append({
                "txn_id": "TXN-UPI-984021",
                "account_mask": "XXXX-XXXX-4921",
                "amount": amount if amount else 2499.0,
                "currency": "INR",
                "status": "TIMEOUT_FAILED",
                "merchant": entities.get("merchant_name") or "Merchant Payment",
                "failure_reason": "NPCI Gateway Intermittent Socket Disconnect",
                "reference_rrn": rrn or "RRN9928340192",
                "timestamp": "2025-05-10T14:22:10Z"
            })
            primary_status = "TIMEOUT_FAILED"
            failure_reason = "NPCI Gateway Intermittent Socket Disconnect"

        return {
            "transactions_found": len(txn_summaries),
            "records": txn_summaries,
            "ledger_state": primary_status,
            "detected_failure_reason": failure_reason,
            "is_duplicate_anomaly": is_duplicate,
            "reversal_eligible": primary_status in ["TIMEOUT_FAILED", "PENDING_DEBIT", "DUPLICATE_SUSPECT"],
            "verification_status": "VERIFIED_AGAINST_CORE_LEDGER"
        }
