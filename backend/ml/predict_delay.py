"""
Delivery delay prediction with XGBoost.

Usage:
    python predict_delay.py            # train, evaluate, save models, run a demo prediction

Requirements:
    pip install xgboost scikit-learn pandas joblib
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score, classification_report, f1_score,
    mean_absolute_error, r2_score, roc_auc_score,
)
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "india_delivery_dataset.csv"
MODEL_PATH = BASE_DIR / "delay_model.joblib"

CATEGORICAL = ["vehicle_type", "weather_condition", "traffic_condition"]
NUMERIC = ["distance_km", "package_weight_kg", "num_stops", "expected_time_hours"]
FEATURES = CATEGORICAL + NUMERIC

# Known categories (fixed so training and prediction encode identically)
CATEGORIES = {
    "vehicle_type": ["Motorbike", "Electric Bike", "Electric Van", "Diesel Van", "Diesel Truck"],
    "weather_condition": ["Clear", "Cloudy", "Fog", "Light Rain", "Heavy Rain"],
    "traffic_condition": ["Low", "Moderate", "High", "Severe"],
}


def prepare(df: pd.DataFrame) -> pd.DataFrame:
    """Select features, add engineered ones, and encode categoricals."""
    X = df[FEATURES].copy()
    for col, cats in CATEGORIES.items():
        X[col] = pd.Categorical(X[col], categories=cats)

    # Engineered features
    X["weight_per_stop"] = X["package_weight_kg"] / X["num_stops"]
    X["km_per_stop"] = X["distance_km"] / X["num_stops"]
    X["avg_speed_kmph"] = X["distance_km"] / X["expected_time_hours"]
    return X


def train():
    df = pd.read_csv(DATA_PATH)

    # Excluded to avoid leakage: actual_delivery_time_hours, delay_hours (only known after delivery)
    X = prepare(df)
    y_cls = df["is_delayed"]
    y_reg = df["delay_hours"]

    X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
        X, y_cls, y_reg, test_size=0.2, random_state=42, stratify=y_cls
    )

    # --- Classifier: will it be delayed? ---
    clf = XGBClassifier(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        enable_categorical=True,
        tree_method="hist",
        eval_metric="logloss",
        random_state=42,
    )
    clf.fit(X_train, yc_train)

    proba = clf.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)
    print("=== Delay classification (is_delayed) ===")
    print(f"Accuracy: {accuracy_score(yc_test, pred):.3f}")
    print(f"F1:       {f1_score(yc_test, pred):.3f}")
    print(f"ROC AUC:  {roc_auc_score(yc_test, proba):.3f}")
    print(classification_report(yc_test, pred, target_names=["On time", "Delayed"]))

    # --- Regressor: by how many hours? ---
    reg = XGBRegressor(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        enable_categorical=True,
        tree_method="hist",
        random_state=42,
    )
    reg.fit(X_train, yr_train)

    reg_pred = reg.predict(X_test)
    print("=== Delay hours regression (delay_hours) ===")
    print(f"MAE: {mean_absolute_error(yr_test, reg_pred):.3f} h")
    print(f"R2:  {r2_score(yr_test, reg_pred):.3f}")

    # Feature importance
    imp = pd.Series(clf.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\n=== Feature importance (classifier) ===")
    print(imp.round(3).to_string())

    joblib.dump({"classifier": clf, "regressor": reg}, MODEL_PATH)
    print(f"\nSaved models to {MODEL_PATH}")


def predict(deliveries: list[dict]) -> pd.DataFrame:
    """Predict delay for one or more deliveries.

    Each dict needs: vehicle_type, distance_km, package_weight_kg,
    weather_condition, traffic_condition, num_stops, expected_time_hours
    """
    models = joblib.load(MODEL_PATH)
    X = prepare(pd.DataFrame(deliveries))

    out = pd.DataFrame(deliveries)
    out["delay_probability"] = models["classifier"].predict_proba(X)[:, 1].round(3)
    out["will_be_delayed"] = out["delay_probability"] >= 0.5
    out["predicted_delay_hours"] = models["regressor"].predict(X).round(2)
    return out


if __name__ == "__main__":
    train()

    demo = [
        {
            "vehicle_type": "Diesel Truck",
            "distance_km": 120.0,
            "package_weight_kg": 3000.0,
            "weather_condition": "Heavy Rain",
            "traffic_condition": "Severe",
            "num_stops": 14,
            "expected_time_hours": 8.0,
        },
        {
            "vehicle_type": "Electric Bike",
            "distance_km": 8.0,
            "package_weight_kg": 5.0,
            "weather_condition": "Clear",
            "traffic_condition": "Low",
            "num_stops": 3,
            "expected_time_hours": 0.8,
        },
    ]
    print("\n=== Demo predictions ===")
    print(predict(demo).to_string(index=False))
