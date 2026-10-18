"""
Module 6: Interactive What-If Scenario Analysis API Route
Simulates changes in route distance, traffic, weather, vehicle type, stops, and priority.
Clearly distinguishes real dataset results from simulated what-if projections.
"""

from typing import Dict, Any, Optional
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.data_store import DataStore

router = APIRouter(prefix="/whatif", tags=["What-If Analysis"])

class WhatIfRequest(BaseModel):
    # Baseline or reference parameters
    base_distance_km: float = Field(150.0, ge=1.0, le=500.0)
    base_traffic_level: str = Field("Medium")
    base_weather_condition: str = Field("clear")
    base_vehicle_type: str = Field("truck")
    base_stops: int = Field(2, ge=0, le=10)
    base_rush_hour: str = Field("No")
    base_partner: str = Field("delhivery")

    # Scenario parameters to test
    scenario_distance_km: float = Field(150.0, ge=1.0, le=500.0)
    scenario_traffic_level: str = Field("High")
    scenario_weather_condition: str = Field("rainy")
    scenario_vehicle_type: str = Field("ev van")
    scenario_stops: int = Field(1, ge=0, le=10)
    scenario_rush_hour: str = Field("No")
    scenario_partner: str = Field("delhivery")

def simulate_metrics(
    distance_km: float,
    traffic: str,
    weather: str,
    vehicle: str,
    stops: int,
    rush_hour: str,
    partner: str,
    model
) -> Dict[str, Any]:
    """Calculates simulated delivery metrics using ML delay model and empirical supply chain physics."""

    # Vehicle baseline operational speed & cost parameters
    vehicle_params = {
        "bike": {"base_speed_kmh": 28.0, "fuel_cost_per_km": 2.2, "emission_per_km": 0.05, "cost_base": 350.0},
        "ev bike": {"base_speed_kmh": 26.0, "fuel_cost_per_km": 0.6, "emission_per_km": 0.015, "cost_base": 300.0},
        "van": {"base_speed_kmh": 38.0, "fuel_cost_per_km": 7.5, "emission_per_km": 0.22, "cost_base": 700.0},
        "ev van": {"base_speed_kmh": 36.0, "fuel_cost_per_km": 2.4, "emission_per_km": 0.045, "cost_base": 650.0},
        "truck": {"base_speed_kmh": 42.0, "fuel_cost_per_km": 15.0, "emission_per_km": 0.42, "cost_base": 1200.0}
    }
    vp = vehicle_params.get(vehicle.lower(), vehicle_params["van"])

    # Traffic multiplier on transit duration
    traffic_factors = {"Low": 0.85, "Medium": 1.0, "High": 1.35, "Severe": 1.85}
    tf = traffic_factors.get(traffic, 1.0)
    if rush_hour == "Yes":
        tf *= 1.2

    # Weather multiplier
    weather_factors = {"clear": 1.0, "cold": 1.06, "hot": 1.04, "rainy": 1.25, "foggy": 1.35}
    wf = weather_factors.get(weather.lower(), 1.0)

    # Weather severity mapping for ML feature
    sev_map = {"clear": 1, "cold": 2, "hot": 2, "rainy": 3, "foggy": 4}
    weather_severity = sev_map.get(weather.lower(), 2)

    # Estimated delivery time in hours
    effective_speed = max(10.0, vp["base_speed_kmh"] / (tf * wf))
    transit_hours = distance_km / effective_speed
    handling_hours = 1.0 + (stops * 0.45)
    estimated_delivery_time = round(transit_hours + handling_hours, 1)

    # Estimated expected benchmark time
    benchmark_time = round((distance_km / 35.0) + 1.5, 1)

    # ML Delay Probability via trained model
    delay_prob = 0.25 # fallback
    if model is not None:
        try:
            # Construct synthetic prediction record conforming strictly to schema
            row = {
                "delivery_partner": partner,
                "package_type": "groceries",
                "vehicle_type": vehicle,
                "delivery_mode": "express",
                "region": "Mumbai",
                "weather_condition": weather,
                "traffic_level": traffic,
                "delivery_priority": "High",
                "warehouse_location": "Mumbai",
                "customer_type": "B2C",
                "delivery_shift": "Evening" if rush_hour == "Yes" else "Morning",
                "operational_zone": "West Zone",
                "source_city": "Mumbai",
                "destination_city": "Pune",
                "route_type": "Highway",
                "driver_age_group": "26-35",
                "accident_history_flag": "No",
                "rush_hour_delivery": rush_hour,
                "weekend_delivery": "No",
                "holiday_season": "No",
                "distance_km": float(distance_km),
                "package_weight_kg": 25.0,
                "expected_time_hours": float(benchmark_time),
                "driver_experience_years": 5.0,
                "order_value": 5000.0,
                "driver_rating": 4.2,
                "road_quality_index": 75.0,
                "number_of_stops": int(stops),
                "warehouse_to_customer_distance": float(distance_km * 1.08),
                "vehicle_capacity_utilization": 75.0,
                "weather_severity_score": weather_severity,
                "driver_daily_deliveries": 25,
                "maintenance_score": 80.0
            }
            row_df = pd.DataFrame([row])
            delay_prob = float(model.predict_proba(row_df)[0][1])
        except Exception:
            # Empirical fallback if feature misalignment occurs
            delay_prob = min(0.98, max(0.05, 0.15 * tf * wf + (stops * 0.04)))

    # Costs and Emissions
    fuel_cost = round(distance_km * vp["fuel_cost_per_km"] * (1.0 + (tf - 1.0) * 0.5), 2)
    delivery_cost = round(vp["cost_base"] + (distance_km * 3.5) + (stops * 50.0), 2)
    carbon_kg = round(distance_km * vp["emission_per_km"], 2)

    return {
        "estimated_delivery_time_hours": estimated_delivery_time,
        "delay_risk_pct": round(delay_prob * 100, 2),
        "delivery_cost": delivery_cost,
        "fuel_cost": fuel_cost,
        "carbon_emission_kg": carbon_kg,
        "effective_speed_kmh": round(effective_speed, 1),
        "is_ev": "ev" in vehicle.lower()
    }

@router.post("/simulate")
def run_whatif_simulation(req: WhatIfRequest):
    store = DataStore.get_instance()
    model = store.get_model()

    base_results = simulate_metrics(
        distance_km=req.base_distance_km,
        traffic=req.base_traffic_level,
        weather=req.base_weather_condition,
        vehicle=req.base_vehicle_type,
        stops=req.base_stops,
        rush_hour=req.base_rush_hour,
        partner=req.base_partner,
        model=model
    )

    scenario_results = simulate_metrics(
        distance_km=req.scenario_distance_km,
        traffic=req.scenario_traffic_level,
        weather=req.scenario_weather_condition,
        vehicle=req.scenario_vehicle_type,
        stops=req.scenario_stops,
        rush_hour=req.scenario_rush_hour,
        partner=req.scenario_partner,
        model=model
    )

    # Compute deltas
    time_diff = round(scenario_results["estimated_delivery_time_hours"] - base_results["estimated_delivery_time_hours"], 2)
    delay_risk_diff = round(scenario_results["delay_risk_pct"] - base_results["delay_risk_pct"], 2)
    cost_diff = round(scenario_results["delivery_cost"] - base_results["delivery_cost"], 2)
    fuel_diff = round(scenario_results["fuel_cost"] - base_results["fuel_cost"], 2)
    carbon_diff = round(scenario_results["carbon_emission_kg"] - base_results["carbon_emission_kg"], 2)

    return {
        "simulation_disclaimer": "SIMULATED SCENARIO - Generated using ML delay risk classifier and calibrated supply chain formulas. Not live GPS tracking or physical sensor data.",
        "is_simulated": True,
        "baseline": base_results,
        "scenario": scenario_results,
        "deltas": {
            "time_difference_hours": time_diff,
            "delay_risk_diff_pct": delay_risk_diff,
            "cost_difference": cost_diff,
            "fuel_difference": fuel_diff,
            "carbon_difference_kg": carbon_diff
        }
    }
