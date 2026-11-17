# FinAssist 360 – Demonstration Scenarios & Evaluation Walkthrough

This guide details the 6 demonstration scenarios implemented in **FinAssist 360** for project review and testing.

---

## Scenario 1: Payment Deducted but Merchant Not Credited

1. Navigate to **AI Service Desk** (`/service-desk`).
2. Click the preset prompt:
   > *"My UPI payment of INR 4,299 was debited for Flipkart order, but the merchant did not receive money. RRN is RRN9928340192."*
3. Click **Analyze & Process Complaint**.
4. Observe the Multi-Agent pipeline:
   - **Agent 1** extracts RRN `RRN9928340192`, amount `₹4,299.00`, and intent `PAYMENT_DEBIT_WITHOUT_CREDIT`.
   - **Agent 2** maps the complaint to `Payment Failure` with priority `P3 – Medium`.
   - **Agent 3** audits the core banking ledger and verifies NPCI timeout response code 91.
   - **Agent 4 (RAG)** retrieves the Central Bank T+1 auto-reversal directive.
   - **Agent 5** isolates the root cause to switch socket timeouts.
   - **Agent 6** routes the incident to `Retail Payments & Settlements`.
   - **Agent 7** drafts customer communication with official tracking reference.
5. Click **Inspect Incident Record** to view the live created incident.

---

## Scenario 2: ATM Unavailable / Cash Dispense Failure

1. In **AI Service Desk**, enter:
   > *"I tried to withdraw INR 10,000 from ATM-MUM-402 Bandra. Account was deducted but no cash came out from dispenser shutter."*
2. Click **Analyze & Process Complaint**.
3. **Agent 3** checks simulated ATM dispenser sensors and detects hardware error `Code D-01 (Dispenser Transport Jam)`.
4. **Agent 4** retrieves the ATM troubleshooting SOP explaining the 24-hour end-of-day purge bin reconciliation procedure.
5. An incident is logged and routed to `ATM Operations & Field Maintenance`.

---

## Scenario 3: Mobile Banking Application Login Failure

1. In **AI Service Desk**, enter:
   > *"My mobile banking application is not opening and showing SIM binding verification failed after updating to Android 14."*
2. Multi-agent mesh identifies client-side security SIM binding checks, routing ticket to `Digital Banking Technical Support` with troubleshooting guidance (verifying primary SIM slot, clearing application cache).

---

## Scenario 4: Duplicate Transaction Complaint (Managerial Approval Trigger)

1. In **AI Service Desk**, enter:
   > *"I was charged twice for INR 89,900 on my card for Apple Store purchase. Please refund the duplicate debit immediately."*
2. Because the disputed amount (₹89,900) exceeds the automated threshold of ₹50,000:
   - **Agent 6 (Workflow Coordination)** triggers human approval gate `MANUAL_REVERSAL_HIGH_VALUE`.
3. Open **Workflow Management** (`/workflows`).
4. Notice the pending approval in the **Pending Human Approval Queue**.
5. Switch persona to **Service Manager** (or click **Approve**), enter justification, and confirm the manual credit reversal.

---

## Scenario 5: Common Payment Gateway Disruption (Cross-Service Blast Radius)

1. Navigate to **Banking Operations** (`/operations`).
2. Select **Payment Gateway Service (PAYMENT_GATEWAY)**.
3. In the Cross-Service Impact Simulator, select state **Complete Outage** and click **Analyze Impact & Mitigations**.
4. The system calculates the dependency DAG:
   - Downstream dependents: `UPI Payment Service`, `Card Processing Service`, `Internet Banking Service`.
   - Impaired business capabilities: Merchant checkout, instant QR payments.
   - Recommended Mitigations: Immediate failover to secondary acquiring tunnel and rate-limiting batch sweeps.

---

## Scenario 6: Repeated Incidents Indicating Failure Recurrence (Machine Learning)

1. Navigate to **Predictive Intelligence** (`/predictions`).
2. Review the Scikit-learn Random Forest model metrics:
   - **Accuracy**: ~89%
   - **Precision**: ~86%
   - **Recall**: ~88%
   - **F1-Score**: ~87%
3. Review the recurrence risk assessment table:
   - `Payment Gateway Service` flagged with **Critical Recurrence Risk (78%)**.
   - `UPI Payment Service` flagged with **High Recurrence Risk (65%)**.
4. Select a service and click **Run Predictive Inference** to evaluate operational risk in real time.
