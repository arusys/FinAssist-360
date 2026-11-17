from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class IncidentClassificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Incident Classification Agent",
            role="Severity Assessment, Category Mapping & Department Routing"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        req_info = state.get("customer_request", {})
        intent = req_info.get("intent", "GENERAL_INQUIRY")
        service_name = req_info.get("service_name", "UPI Payment Service")
        entities = req_info.get("extracted_entities", {})
        amount = entities.get("amount") or 0.0

        # Mapping rules based on banking operational standards
        if intent in ["PAYMENT_DEBIT_WITHOUT_CREDIT", "DUPLICATE_DEBIT_DISPUTE"]:
            category = "Payment Failure" if intent == "PAYMENT_DEBIT_WITHOUT_CREDIT" else "Transaction Disputes"
            department = "Retail Payments & Settlements"
            priority = "P2 – High" if amount >= 25000 else "P3 – Medium"
            sla_hours = 4 if priority == "P2 – High" else 24
        elif intent == "ATM_DISPENSE_FAILURE":
            category = "ATM Failure"
            department = "ATM Operations & Field Maintenance"
            priority = "P2 – High"
            sla_hours = 4
        elif intent == "CARD_TRANSACTION_DECLINE":
            category = "Card Issues"
            department = "Card Services & Fraud Risk"
            priority = "P3 – Medium"
            sla_hours = 24
        elif intent == "MOBILE_APP_LOGIN_FAILURE":
            category = "Mobile Banking"
            department = "Digital Banking Technical Support"
            priority = "P2 – High"
            sla_hours = 4
        elif intent == "INTERNET_BANKING_ACCESS_FAILURE":
            category = "Internet Banking"
            department = "Digital Banking Technical Support"
            priority = "P3 – Medium"
            sla_hours = 12
        else:
            category = "Account Access"
            department = "Customer Support Operations"
            priority = "P4 – Low"
            sla_hours = 48

        return {
            "category": category,
            "priority": priority,
            "assigned_department": department,
            "sla_target_hours": sla_hours,
            "routing_confidence": 0.94,
            "recommended_technician_role": "Banking Support Agent" if priority in ["P3 – Medium", "P4 – Low"] else "Technical Support Engineer"
        }
