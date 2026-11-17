import re
from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class CustomerRequestUnderstandingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Customer Request Understanding Agent",
            role="Intent Classification, Entity Extraction & Channel Identification"
        )

    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        query = state.get("query", "").strip()
        q_lower = query.lower()

        # Intent detection
        intent = "GENERAL_INQUIRY"
        affected_service_code = "UPI_PAYMENT"
        service_name = "UPI Payment Service"

        if any(w in q_lower for w in ["deducted", "debited", "merchant", "not received", "didn't receive", "upi", "gpay", "phonepe"]):
            intent = "PAYMENT_DEBIT_WITHOUT_CREDIT"
            affected_service_code = "UPI_PAYMENT"
            service_name = "UPI Payment Service"
        elif any(w in q_lower for w in ["atm", "cash", "withdraw", "dispense", "shutter"]):
            intent = "ATM_DISPENSE_FAILURE"
            affected_service_code = "ATM_NETWORK"
            service_name = "ATM Network Service"
        elif any(w in q_lower for w in ["card", "declined", "pos", "swipe", "blocked", "cvv"]):
            intent = "CARD_TRANSACTION_DECLINE"
            affected_service_code = "CARD_PROCESSING"
            service_name = "Card Processing Service"
        elif any(w in q_lower for w in ["mobile app", "mobile banking", "app crash", "not opening", "login", "mpin"]):
            intent = "MOBILE_APP_LOGIN_FAILURE"
            affected_service_code = "MOBILE_BANKING"
            service_name = "Mobile Banking Service"
        elif any(w in q_lower for w in ["net banking", "internet banking", "portal", "website", "otp"]):
            intent = "INTERNET_BANKING_ACCESS_FAILURE"
            affected_service_code = "INTERNET_BANKING"
            service_name = "Internet Banking Service"
        elif any(w in q_lower for w in ["duplicate", "twice", "charged double", "double debit"]):
            intent = "DUPLICATE_DEBIT_DISPUTE"
            affected_service_code = "PAYMENT_GATEWAY"
            service_name = "Payment Gateway Service"

        # Entity extraction
        # Look for numbers (amounts like ₹500, Rs. 1000, 2500)
        amount_match = re.search(r'(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)', q_lower)
        extracted_amount = None
        if amount_match and float(amount_match.group(1).replace(',', '')) > 10:
            extracted_amount = float(amount_match.group(1).replace(',', ''))

        # Look for RRN or Reference Numbers (12 digits or alphanumeric)
        rrn_match = re.search(r'\b(rrn\d{6,12}|\d{12})\b', q_lower)
        extracted_rrn = rrn_match.group(1).upper() if rrn_match else None

        # Look for terminal ID or Merchant name
        merchant_name = None
        for m in ["flipkart", "amazon", "swiggy", "zomato", "starbucks", "uber"]:
            if m in q_lower:
                merchant_name = m.capitalize()
                break

        return {
            "intent": intent,
            "affected_service_code": affected_service_code,
            "service_name": service_name,
            "extracted_entities": {
                "amount": extracted_amount,
                "reference_rrn": extracted_rrn,
                "merchant_name": merchant_name,
                "customer_sentiment": "FRUSTRATED" if any(w in q_lower for w in ["urgently", "stole", "cheated", "worst", "immediate"]) else "NEUTRAL"
            },
            "summary": f"Customer reporting {intent.replace('_', ' ').title()} related to {service_name}."
        }
