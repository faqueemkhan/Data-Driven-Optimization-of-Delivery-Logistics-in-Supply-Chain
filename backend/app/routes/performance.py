"""
Module 5: Logistics Performance Analysis API Route
In-depth supply chain performance analytics across Delivery Partners, Vehicles, Weather, and Traffic.
"""

from fastapi import APIRouter
from app.data_store import DataStore

router = APIRouter(prefix="/performance", tags=["Performance Analysis"])

@router.get("/")
def get_logistics_performance():
    store = DataStore.get_instance()
    cached = store.get_cached("performance")
    if cached is not None:
        return cached

    df = store.get_data()

    # 1. Delivery Partner Performance
    partner_perf = []
    p_grp = df.groupby("delivery_partner").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_cost=("delivery_cost", "mean"),
        avg_fuel=("fuel_cost", "mean"),
        avg_profit=("net_profit", "mean"),
        avg_rating=("delivery_rating", "mean"),
        avg_penalty=("late_delivery_penalty", "mean"),
        avg_carbon=("carbon_emission_kg", "mean"),
        avg_time=("delivery_time_hours", "mean")
    ).reset_index().sort_values("volume", ascending=False)

    for _, r in p_grp.iterrows():
        vol = int(r["volume"])
        deliv_delay = int(r["delayed"])
        partner_perf.append({
            "partner": r["delivery_partner"],
            "deliveries": vol,
            "delay_count": deliv_delay,
            "on_time_count": vol - deliv_delay,
            "delay_rate_pct": round((deliv_delay / vol) * 100, 2),
            "on_time_rate_pct": round(((vol - deliv_delay) / vol) * 100, 2),
            "avg_cost": round(float(r["avg_cost"]), 2),
            "avg_fuel_cost": round(float(r["avg_fuel"]), 2),
            "avg_profit": round(float(r["avg_profit"]), 2),
            "avg_rating": round(float(r["avg_rating"]), 2),
            "avg_penalty": round(float(r["avg_penalty"]), 2),
            "avg_carbon_kg": round(float(r["avg_carbon"]), 2),
            "avg_time_hours": round(float(r["avg_time"]), 2)
        })

    # 2. Vehicle Type Performance
    vehicle_perf = []
    v_grp = df.groupby("vehicle_type").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_fuel=("fuel_cost", "mean"),
        avg_carbon=("carbon_emission_kg", "mean"),
        avg_capacity=("vehicle_capacity_utilization", "mean"),
        avg_weight=("package_weight_kg", "mean"),
        avg_speed=("effective_speed_kmh", "mean"),
        avg_maintenance=("maintenance_score", "mean")
    ).reset_index()

    for _, r in v_grp.iterrows():
        vol = int(r["volume"])
        is_ev = "ev" in str(r["vehicle_type"]).lower()
        vehicle_perf.append({
            "vehicle_type": r["vehicle_type"],
            "is_ev": is_ev,
            "deliveries": vol,
            "delay_rate_pct": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_fuel_cost": round(float(r["avg_fuel"]), 2),
            "avg_carbon_kg": round(float(r["avg_carbon"]), 2),
            "avg_capacity_pct": round(float(r["avg_capacity"]), 2),
            "avg_weight_kg": round(float(r["avg_weight"]), 2),
            "avg_speed_kmh": round(float(r["avg_speed"]), 2),
            "avg_maintenance_score": round(float(r["avg_maintenance"]), 1)
        })

    # 3. Weather Condition Impact
    weather_perf = []
    w_grp = df.groupby("weather_condition").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_time=("delivery_time_hours", "mean"),
        avg_traffic_delay=("traffic_delay_minutes", "mean"),
        avg_severity=("weather_severity_score", "mean"),
        avg_deviation=("gps_route_deviation_km", "mean")
    ).reset_index()

    for _, r in w_grp.iterrows():
        vol = int(r["volume"])
        weather_perf.append({
            "weather": r["weather_condition"],
            "deliveries": vol,
            "delay_rate_pct": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_time_hours": round(float(r["avg_time"]), 2),
            "avg_traffic_delay_mins": round(float(r["avg_traffic_delay"]), 1),
            "avg_severity_score": round(float(r["avg_severity"]), 2),
            "avg_gps_deviation_km": round(float(r["avg_deviation"]), 2)
        })

    # 4. Traffic Level Impact
    traffic_perf = []
    t_grp = df.groupby("traffic_level").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_delay_mins=("traffic_delay_minutes", "mean"),
        avg_time=("delivery_time_hours", "mean"),
        avg_fuel=("fuel_cost", "mean")
    ).reset_index()

    traffic_order = {"Low": 1, "Medium": 2, "High": 3, "Severe": 4}
    t_grp["sort_order"] = t_grp["traffic_level"].map(traffic_order).fillna(99)
    t_grp = t_grp.sort_values("sort_order")

    for _, r in t_grp.iterrows():
        vol = int(r["volume"])
        traffic_perf.append({
            "traffic_level": r["traffic_level"],
            "deliveries": vol,
            "delay_rate_pct": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_traffic_delay_mins": round(float(r["avg_delay_mins"]), 1),
            "avg_time_hours": round(float(r["avg_time"]), 2),
            "avg_fuel_cost": round(float(r["avg_fuel"]), 2)
        })

    # 5. Rush Hour vs Non-Rush Hour Cross Tab
    rush_hour_comp = []
    rh_grp = df.groupby(["traffic_level", "rush_hour_delivery"]).agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum")
    ).reset_index()

    for _, r in rh_grp.iterrows():
        vol = int(r["volume"])
        rush_hour_comp.append({
            "traffic_level": r["traffic_level"],
            "rush_hour": r["rush_hour_delivery"],
            "volume": vol,
            "delay_rate_pct": round((int(r["delayed"]) / vol) * 100, 2)
        })

    result = {
        "partner_performance": partner_perf,
        "vehicle_performance": vehicle_perf,
        "weather_impact": weather_perf,
        "traffic_impact": traffic_perf,
        "rush_hour_comparison": rush_hour_comp
    }

    store.set_cached("performance", result)
    return result
