import os
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from app.ml.synthetic_data_generator import generate_historical_incidents
from app.core.config import settings

class IncidentPredictor:
    def __init__(self):
        self.model_pipeline: Pipeline = None
        self.metrics: Dict[str, Any] = {}
        self.feature_names: List[str] = []
        self.is_trained = False

    def train_model(self) -> Dict[str, Any]:
        """Trains Random Forest model on synthetic banking incident dataset with strict train/test split."""
        df = generate_historical_incidents(num_samples=400)
        
        # Save dataset to synthetic_datasets directory for inspection
        data_path = os.path.join(settings.SYNTHETIC_DATA_DIR, "historical_incidents.csv")
        os.makedirs(settings.SYNTHETIC_DATA_DIR, exist_ok=True)
        df.to_csv(data_path, index=False)

        # Feature definition
        feature_cols = [
            "service",
            "category",
            "severity",
            "hour_of_day",
            "is_peak_hour",
            "prev_failures_30d",
            "historical_cat_count",
            "resolution_duration_mins"
        ]
        X = df[feature_cols]
        y = df["is_recurring_risk"]

        # Train / Test split (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        categorical_cols = ["service", "category", "severity"]
        numerical_cols = ["hour_of_day", "is_peak_hour", "prev_failures_30d", "historical_cat_count", "resolution_duration_mins"]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
                ("num", "passthrough", numerical_cols)
            ]
        )

        self.model_pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(
                n_estimators=100,
                max_depth=6,
                min_samples_split=4,
                random_state=42
            ))
        ])

        # Fit model
        self.model_pipeline.fit(X_train, y_train)

        # Evaluate on test set
        y_pred = self.model_pipeline.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))

        self.metrics = {
            "model_name": "RandomForest_BankingFailureRecurrence_v1",
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "total_training_samples": len(X_train),
            "total_test_samples": len(X_test),
            "features_analyzed": feature_cols,
            "training_timestamp": pd.Timestamp.now().isoformat()
        }
        self.is_trained = True
        return self.metrics

    def predict_service_risk(
        self,
        service: str,
        category: str = "Payment Failure",
        severity: str = "P2 – High",
        hour_of_day: int = 14,
        prev_failures_30d: int = 4,
        historical_cat_count: int = 12,
        resolution_duration_mins: int = 120
    ) -> Dict[str, Any]:
        """Runs model inference to compute recurrence probability and preventive guidance."""
        if not self.is_trained:
            self.train_model()

        is_peak = 1 if (10 <= hour_of_day <= 14 or 19 <= hour_of_day <= 22) else 0

        input_df = pd.DataFrame([{
            "service": service,
            "category": category,
            "severity": severity,
            "hour_of_day": hour_of_day,
            "is_peak_hour": is_peak,
            "prev_failures_30d": prev_failures_30d,
            "historical_cat_count": historical_cat_count,
            "resolution_duration_mins": resolution_duration_mins
        }])

        proba = float(self.model_pipeline.predict_proba(input_df)[0][1])

        # Assign risk tier
        if proba >= 0.70:
            risk_level = "Critical"
            predicted_freq = 3.5  # recurrence within ~3-4 days
            driver = "High previous failure frequency combined with peak traffic volatility"
            actions = (
                "1. Trigger proactive switch failover testing.\n"
                "2. Double circuit capacity on payment network interface.\n"
                "3. Enable aggressive synthetic health probes every 60 seconds."
            )
        elif proba >= 0.45:
            risk_level = "High"
            predicted_freq = 7.0
            driver = "Cluster of recent transient timeouts during settlement cycles"
            actions = (
                "1. Review DB connection pool saturation and query latency.\n"
                "2. Verify NPCI/Mastercard gateway latency metrics.\n"
                "3. Schedule precautionary restart during low-volume window."
            )
        elif proba >= 0.25:
            risk_level = "Medium"
            predicted_freq = 14.0
            driver = "Occasional end-user network drops or authentication retries"
            actions = (
                "1. Monitor digital banking microservice error rates.\n"
                "2. Keep operations engineers informed during morning peak."
            )
        else:
            risk_level = "Low"
            predicted_freq = 30.0
            driver = "Stable operational history with low failure velocity"
            actions = "Standard continuous monitoring; no immediate manual intervention needed."

        return {
            "service_name": service,
            "recurrence_risk_score": round(proba, 4),
            "risk_level": risk_level,
            "predicted_frequency_days": predicted_freq,
            "primary_failure_driver": driver,
            "recommended_preventive_actions": actions,
            "confidence_score": round(0.82 + (0.12 * proba), 2)
        }

# Global predictor instance
global_predictor = IncidentPredictor()
