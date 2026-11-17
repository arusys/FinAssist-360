# FinAssist 360 – Predictive Incident Intelligence (Machine Learning)

## 1. Objective

Banking operations teams face recurring failure patterns (such as gateway socket timeouts during morning salary credits or evening e-commerce peak volumes). The Machine Learning module in FinAssist 360 models historical operational telemetry to compute **Failure Recurrence Risk Scores** and recommend proactive engineering mitigations before widespread disruption occurs.

---

## 2. Feature Architecture

The model analyzes 8 operational signals:

| Feature Name | Type | Description |
|---|---|---|
| `service` | Categorical | Targeted banking service (e.g. `Payment Gateway Service`, `UPI Payment Service`) |
| `category` | Categorical | Incident category (`Payment Failure`, `ATM Failure`, etc.) |
| `severity` | Categorical | Assigned severity tier (`P1`, `P2`, `P3`, `P4`) |
| `hour_of_day` | Numerical | Time of occurrence (0 to 23 hours) |
| `is_peak_hour` | Binary | Peak transaction window indicator (10:00-14:00, 19:00-22:00) |
| `prev_failures_30d` | Numerical | Number of recorded failure incidents in past 30 days |
| `historical_cat_count`| Numerical | Category velocity frequency |
| `resolution_duration_mins` | Numerical | Mean resolution time in minutes |

**Target Variable**: `is_recurring_risk` (Binary: `1` = High risk of recurring within 14 days, `0` = Low recurrence risk).

---

## 3. Algorithm & Training Methodology

- **Classifier**: Scikit-learn `RandomForestClassifier`
  - `n_estimators`: 100
  - `max_depth`: 6
  - `min_samples_split`: 4
  - `random_state`: 42
- **Preprocessing**: `ColumnTransformer` with `OneHotEncoder(handle_unknown='ignore')` for categorical features and `passthrough` for numerical signals.
- **Validation**: Strict 80/20 train/test stratified split.

### Evaluation Metrics (Achieved on Test Set)

- **Accuracy**: ~89.0%
- **Precision**: ~86.0%
- **Recall**: ~88.0%
- **F1-Score**: ~87.0%

---

## 4. Explainability & Preventive Action Matrix

| Predicted Recurrence Risk | Risk Tier | Predicted Recurrence Window | Actionable Mitigation |
|---|---|---|---|
| **≥ 70%** | Critical | ~3.5 Days | Trigger proactive switch failover testing; double circuit bandwidth; enable synthetic health probes every 60s. |
| **45% - 69%** | High | ~7.0 Days | Review database connection pool saturation; check NPCI gateway socket latency; schedule precautionary restart. |
| **25% - 44%** | Medium | ~14.0 Days | Monitor digital banking error rates; keep operations on-call informed during peak morning window. |
| **< 25%** | Low | ~30.0 Days | Standard monitoring; no immediate manual intervention needed. |
