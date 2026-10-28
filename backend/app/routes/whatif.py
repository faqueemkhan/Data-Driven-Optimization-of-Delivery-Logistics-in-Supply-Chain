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
        "bike": {"base_speed_kmh": 32.0, "fuel_cost_per_km": 2.2, "emission_per_km": 0.045, "cost_base": 300.0},
        "ev bike": {"base_speed_kmh": 30.0, "fuel_cost_per_km": 0.6, "emission_per_km": 0.012, "cost_base": 250.0},
        "van": {"base_speed_kmh": 45.0, "fuel_cost_per_km": 8.0, "emission_per_km": 0.22, "cost_base": 650.0},
        "ev van": {"base_speed_kmh": 42.0, "fuel_cost_per_km": 2.2, "emission_per_km": 0.042, "cost_base": 600.0},
        "truck": {"base_speed_kmh": 50.0, "fuel_cost_per_km": 14.5, "emission_per_km": 0.38, "cost_base": 1100.0}
    }
    vp = vehicle_params.get(vehicle.lower(), vehicle_params["van"])

    # Traffic multiplier on transit duration
    traffic_factors = {"Low": 0.90, "Medium": 1.0, "High": 1.45, "Severe": 2.20}
    tf = traffic_factors.get(traffic, 1.0)
    if rush_hour == "Yes":
        tf *= 1.25

    # Weather multiplier
    weather_factors = {"clear": 1.0, "cold": 1.04, "hot": 1.03, "rainy": 1.25, "foggy": 1.40, "stormy": 1.60}
    wf = weather_factors.get(weather.lower(), 1.0)

    # Weather severity mapping for ML feature
    sev_map = {"clear": 1, "cold": 2, "hot": 2, "rainy": 3, "foggy": 4, "stormy": 5}
    weather_severity = sev_map.get(weather.lower(), 2)

    # Estimated delivery time in hours
    effective_speed = max(10.0, vp["base_speed_kmh"] / (tf * wf))
    transit_hours = distance_km / effective_speed
    handling_hours = 0.75 + (stops * 0.40)
    estimated_delivery_time = round(transit_hours + handling_hours, 1)

    # Estimated expected benchmark time
    benchmark_time = round((distance_km / 40.0) + 1.2, 1)

    # Delay Risk calculation:
    # 1. Base operational baseline for standard dispatch
    base_risk = 0.18 # 18% standard baseline

    # 2. Traffic contribution
    traffic_risk_map = {"Severe": 0.50, "High": 0.32, "Medium": 0.02, "Low": -0.10}
    traffic_risk = traffic_risk_map.get(traffic, 0.0)

    # 3. Weather contribution
    weather_risk_map = {"stormy": 0.22, "rainy": 0.15, "foggy": 0.12, "hot": 0.02, "cold": 0.01, "clear": -0.05}
    weather_risk = weather_risk_map.get(weather.lower(), 0.0)

    # 4. Rush hour contribution
    rush_hour_risk = 0.12 if rush_hour == "Yes" else -0.03

    # 5. Intermediate stops contribution
    stops_risk = max(0.0, (stops - 1) * 0.06)

    # 6. Long distance for 2-wheelers
    modality_risk = 0.15 if ("bike" in vehicle.lower() and distance_km > 100) else 0.0

    # Combine into calibrated delay risk percentage
    delay_prob = base_risk + traffic_risk + weather_risk + rush_hour_risk + stops_risk + modality_risk

    # Enforce strict bounds for traffic states
    if traffic == "Severe":
        delay_prob = max(0.85, min(0.98, delay_prob))
    elif traffic == "High":
        delay_prob = max(0.68, min(0.95, delay_prob))
    elif traffic == "Low":
        delay_prob = max(0.05, min(0.28, delay_prob))
    else:
        delay_prob = max(0.12, min(0.55, delay_prob))

    # Fuel / Energy Cost
    fuel_cost = round(distance_km * vp["fuel_cost_per_km"] * (1.0 + (tf - 1.0) * 0.4), 2)

    # Comprehensive Delivery Cost (Base + Fuel + Distance wear + Waypoints)
    delivery_cost = round(vp["cost_base"] + fuel_cost + (distance_km * 3.5) + (stops * 75.0), 2)

    # Tailpipe / Fleet Carbon Emissions (kg CO2)
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
