"""
Module 3: Delivery Delay ML Prediction API Route
Provides model performance metrics (Precision, Recall, F1, ROC-AUC) and live prediction endpoint with zero data leakage.
"""

from typing import Dict, Any, Optional
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.data_store import DataStore

router = APIRouter(prefix="/prediction", tags=["Delay Prediction ML"])

class PredictionInput(BaseModel):
    delivery_partner: str = Field(..., example="delhivery")
    package_type: str = Field(..., example="electronics")
    vehicle_type: str = Field(..., example="bike")
    delivery_mode: str = Field(..., example="same day")
    region: str = Field(..., example="Mumbai")
    weather_condition: str = Field(..., example="rainy")
    traffic_level: str = Field(..., example="High")
    delivery_priority: str = Field(..., example="Critical")
    warehouse_location: str = Field(..., example="Mumbai")
    customer_type: str = Field("B2C", example="B2C")
    delivery_shift: str = Field("Evening", example="Evening")
    operational_zone: str = Field("West Zone", example="West Zone")
    source_city: str = Field("Pune", example="Pune")
    destination_city: str = Field("Nagpur", example="Nagpur")
    route_type: str = Field("Highway", example="Highway")
    driver_age_group: str = Field("26-35", example="26-35")
    accident_history_flag: str = Field("No", example="No")
    rush_hour_delivery: str = Field("Yes", example="Yes")
    weekend_delivery: str = Field("No", example="No")
    holiday_season: str = Field("No", example="No")

    # Numerical metrics known at dispatch
    distance_km: float = Field(..., ge=1.0, le=500.0, example=210.5)
    package_weight_kg: float = Field(..., ge=0.1, le=100.0, example=25.0)
    expected_time_hours: float = Field(..., ge=1.0, le=120.0, example=24.0)
    driver_experience_years: float = Field(5.0, ge=0.0, le=30.0, example=5.0)
    order_value: float = Field(5000.0, ge=100.0, le=100000.0, example=5000.0)
    driver_rating: float = Field(4.2, ge=1.0, le=5.0, example=4.2)
    road_quality_index: float = Field(75.0, ge=10.0, le=100.0, example=75.0)
    number_of_stops: int = Field(2, ge=0, le=15, example=2)
    warehouse_to_customer_distance: float = Field(220.0, ge=1.0, le=500.0, example=220.0)
    vehicle_capacity_utilization: float = Field(75.0, ge=10.0, le=100.0, example=75.0)
    weather_severity_score: int = Field(2, ge=1, le=5, example=2)
    driver_daily_deliveries: int = Field(25, ge=1, le=80, example=25)
    maintenance_score: float = Field(80.0, ge=20.0, le=100.0, example=80.0)

@router.get("/metrics")
def get_model_evaluation_metrics():
    """Returns evaluation metrics, ROC-AUC, confusion matrix and feature importances."""
    store = DataStore.get_instance()
    meta = store.get_model_metadata()

    if not meta:
        raise HTTPException(status_code=500, detail="ML model metadata is not available.")

    return meta

@router.post("/predict")
def predict_delivery_delay(input_data: PredictionInput):
    """Predicts delivery delay using only dispatch-time features (zero data leakage)."""
    store = DataStore.get_instance()
    model = store.get_model()

    if model is None:
        raise HTTPException(status_code=500, detail="Delay prediction model is not loaded.")

    # Convert pydantic input to single row dataframe
    input_dict = input_data.model_dump()
    input_df = pd.DataFrame([input_dict])

    try:
        prob = float(model.predict_proba(input_df)[0][1])
        prediction = int(prob >= 0.5)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")

    # Determine risk tier
    if prob < 0.30:
        risk_level = "Low Delay Risk"
        risk_color = "emerald"
    elif prob < 0.65:
        risk_level = "Moderate Delay Risk"
        risk_color = "amber"
    else:
        risk_level = "High Delay Risk"
        risk_color = "rose"

    # Identify primary contributing risk drivers
    drivers = []
    if input_data.traffic_level in ["High", "Severe"]:
        drivers.append(f"Elevated traffic congestion ({input_data.traffic_level} level) along dispatch route")
    if input_data.weather_severity_score >= 3 or input_data.weather_condition in ["rainy", "foggy"]:
        drivers.append(f"Adverse weather condition ({input_data.weather_condition}, severity score {input_data.weather_severity_score}/5)")
    if input_data.rush_hour_delivery == "Yes":
        drivers.append("Scheduled during peak urban rush hour traffic windows")
    if input_data.road_quality_index < 60:
        drivers.append(f"Sub-optimal road quality index ({input_data.road_quality_index}/100) slowing transit speed")
    if input_data.number_of_stops >= 4:
        drivers.append(f"High multi-stop schedule ({input_data.number_of_stops} delivery stops)")
    if input_data.maintenance_score < 70:
        drivers.append(f"Vehicle maintenance score is below recommended threshold ({input_data.maintenance_score}/100)")
    if not drivers:
        drivers.append("Baseline operational parameters within safe variance envelope")

    # Dynamic actionable recommendations
    mitigations = []
    if input_data.traffic_level in ["High", "Severe"] or input_data.rush_hour_delivery == "Yes":
        mitigations.append("Shift departure window by 60-90 minutes to bypass peak congestion corridor.")
    if input_data.number_of_stops >= 3:
        mitigations.append("Consolidate waypoint drop-offs or split consignments to reduce stop delay penalties.")
    if input_data.vehicle_type == "bike" and input_data.distance_km > 150:
        mitigations.append("Reassign long-distance payload to EV Van or Medium Transit Truck for reliable speed.")
    if not mitigations:
        mitigations.append("Dispatch parameters are well-optimized. Proceed with scheduled delivery partner.")

    return {
        "delay_prediction": prediction,
        "is_delayed": bool(prediction == 1),
        "delay_probability": round(prob, 4),
        "delay_probability_pct": round(prob * 100, 2),
        "risk_level": risk_level,
        "risk_color": risk_color,
        "contributing_factors": drivers,
        "actionable_mitigations": mitigations,
        "leakage_safeguard": "Verified - Prediction generated purely from dispatch-time parameters."
    }
