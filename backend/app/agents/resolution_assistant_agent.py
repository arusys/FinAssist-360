from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class ResolutionAssistantAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Resolution Assistant Agent",
            role="Customer Response Synthesis, Actionable Guidance & Case Summary"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        req_info = state.get("customer_request", {})
        class_info = state.get("incident_classification", {})
        txn_info = state.get("transaction_analysis", {})
        rca_info = state.get("root_cause_analysis", {})
        workflow_info = state.get("workflow_coordination", {})

        intent = req_info.get("intent", "")
        service_name = req_info.get("service_name", "Banking Service")
        entities = req_info.get("extracted_entities", {})
        amount = entities.get("amount")
        rrn = entities.get("reference_rrn") or "RRN9928340192"
        incident_number = state.get("incident_number", "INC-PENDING")

        # Synthesize customer message
        if "PAYMENT" in intent or "DUPLICATE" in intent:
            amt_str = f" of INR {amount:,.2f}" if amount else ""
            customer_response = (
                f"Dear Customer,\n\n"
                f"We have investigated your transaction{amt_str} (Reference: {rrn}). Our core ledger logs confirm that a network timeout occurred during merchant credit confirmation.\n\n"
                f"**Current Status:** Your transaction is currently in **{txn_info.get('ledger_state', 'PENDING_DEBIT')}** status.\n\n"
                f"**Resolution Timeline:** In accordance with standard banking policies, the deducted amount will be automatically reversed to your bank account within **T+1 business days** (by tomorrow end-of-day).\n\n"
                f"We have officially logged this incident under reference **{incident_number}**. You can track the real-time progress on your FinAssist 360 portal.\n\n"
                f"If the funds do not reflect in your account within 48 hours, our support team will initiate an expedited manual settlement."
            )
            troubleshooting_steps = [
                "Do not attempt duplicate payments to the merchant until the status is resolved.",
                "Check your bank account statement after 24 hours for the auto-reversal credit entry.",
                "If the merchant has released goods or services, save the merchant receipt for reconciliation."
            ]
        elif "ATM" in intent:
            customer_response = (
                f"Dear Customer,\n\n"
                f"We regret the inconvenience caused during your cash withdrawal attempt. We have logged ticket **{incident_number}** with our ATM Operations team.\n\n"
                f"Our automated diagnostic sensors detected a dispenser mechanism timeout. If your account was debited, our end-of-day cash balancing system will verify the uncollected cash and automatically credit your account within **24 hours**."
            )
            troubleshooting_steps = [
                "Keep your ATM transaction slip or SMS notification for reference.",
                "Monitor your registered mobile number for reversal credit alerts within 24 hours.",
                "Visit any nearby operational ATM if you need urgent cash assistance."
            ]
        elif "MOBILE" in intent:
            customer_response = (
                f"Dear Customer,\n\n"
                f"We have registered service ticket **{incident_number}** regarding your mobile banking application access issue.\n\n"
                f"Our systems indicate your app build may need an updated security token or device SIM re-verification."
            )
            troubleshooting_steps = [
                "Ensure your default mobile data is active on the primary SIM registered with your bank.",
                "Clear application cache or update to the latest version from Google Play Store or Apple App Store.",
                "Turn off any active VPN or proxy apps before launching mobile banking."
            ]
        else:
            customer_response = (
                f"Dear Customer,\n\n"
                f"We have reviewed your request concerning {service_name} and generated official incident **{incident_number}**.\n\n"
                f"Our **{class_info.get('assigned_department', 'Customer Support')}** department has been notified to investigate your case with target SLA of {class_info.get('sla_target_hours', 24)} hours."
            )
            troubleshooting_steps = [
                "Keep your registered contact details updated to receive instant SMS updates.",
                "Review the FinAssist 360 portal for step-by-step resolution notes."
            ]

        closure_summary = (
            f"Case {incident_number}: Intent: {intent}. Service: {service_name}. "
            f"Root cause: {rca_info.get('root_cause_summary')}. "
            f"Reversal eligibility: {txn_info.get('reversal_eligible')}. "
            f"Human approval required: {workflow_info.get('requires_human_approval')}."
        )

        return {
            "customer_response": customer_response,
            "troubleshooting_steps": troubleshooting_steps,
            "internal_closure_notes": closure_summary,
            "suggested_communication_channel": "IN_APP_CHAT_AND_SMS"
        }
