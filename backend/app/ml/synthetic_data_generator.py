import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_historical_incidents(num_samples: int = 350) -> pd.DataFrame:
    """Generates realistic synthetic banking incidents for ML model training and evaluation."""
    np.random.seed(42)
    random.seed(42)

    categories = [
        "Payment Failure",
        "ATM Failure",
        "Card Issues",
        "Mobile Banking",
        "Internet Banking",
        "Account Access",
        "Transaction Disputes",
        "Banking Infrastructure"
    ]
    
    services = [
        "UPI Payment Service",
        "NEFT/RTGS Payment Service",
        "ATM Network Service",
        "Mobile Banking Service",
        "Internet Banking Service",
        "Card Processing Service",
        "Payment Gateway Service"
    ]

    severities = ["P1 – Critical", "P2 – High", "P3 – Medium", "P4 – Low"]
    
    rows = []
    base_time = datetime(2024, 1, 1)

    for i in range(num_samples):
        service = random.choice(services)
        
        # Correlated categories based on service
        if "UPI" in service or "Gateway" in service:
            cat = random.choice(["Payment Failure", "Transaction Disputes", "Banking Infrastructure"])
        elif "ATM" in service:
            cat = "ATM Failure"
        elif "Card" in service:
            cat = random.choice(["Card Issues", "Transaction Disputes"])
        elif "Mobile" in service:
            cat = random.choice(["Mobile Banking", "Account Access"])
        elif "Internet" in service:
            cat = random.choice(["Internet Banking", "Account Access"])
        else:
            cat = random.choice(categories)

        # Time of day (peak hours between 10am-2pm, and 7pm-10pm)
        hour = random.randint(0, 23)
        is_peak = 1 if (10 <= hour <= 14 or 19 <= hour <= 22) else 0

        # Prior failure frequency in past 30 days
        if service in ["Payment Gateway Service", "UPI Payment Service"]:
            prev_failures = random.choice([2, 3, 4, 5, 6, 7])
        elif service in ["ATM Network Service"]:
            prev_failures = random.choice([1, 2, 3, 4])
        else:
            prev_failures = random.choice([0, 1, 2, 3])

        # Severity
        if prev_failures >= 4 or (is_peak and "Payment" in service):
            sev = random.choice(["P1 – Critical", "P2 – High"])
        else:
            sev = random.choice(["P2 – High", "P3 – Medium", "P4 – Low"])

        # Incident resolution duration in minutes
        if sev == "P1 – Critical":
            resolution_minutes = random.randint(30, 150)
        elif sev == "P2 – High":
            resolution_minutes = random.randint(60, 300)
        elif sev == "P3 – Medium":
            resolution_minutes = random.randint(180, 720)
        else:
            resolution_minutes = random.randint(360, 1440)

        # Historical incident count in current category
        historical_cat_count = prev_failures * 3 + random.randint(2, 15)

        # Ground truth label: Recurring Incident within 14 days (1 = Recurring Risk, 0 = Non-recurring)
        # Higher probability if previous failures > 3, or peak hours payment gateway incident
        risk_probability = 0.15 + (prev_failures * 0.10) + (0.25 if is_peak else 0.0) + (0.20 if sev in ["P1 – Critical", "P2 – High"] else 0.0)
        risk_probability = min(0.95, risk_probability)
        is_recurring = 1 if random.random() < risk_probability else 0

        rows.append({
            "incident_id": f"INC-HIST-{1000 + i}",
            "service": service,
            "category": cat,
            "severity": sev,
            "hour_of_day": hour,
            "is_peak_hour": is_peak,
            "prev_failures_30d": prev_failures,
            "historical_cat_count": historical_cat_count,
            "resolution_duration_mins": resolution_minutes,
            "is_recurring_risk": is_recurring
        })

    df = pd.DataFrame(rows)
    return df
