"""
Module 4: Route and Regional Geographic Analysis API Route
Provides GPS coordinates for sources, destinations, warehouses, regions, route corridors, and route types.
"""

from typing import List, Dict, Any
from fastapi import APIRouter
from app.data_store import DataStore

router = APIRouter(prefix="/routes-geo", tags=["Route & Regional Analysis"])

@router.get("/")
def get_routes_and_regional_analysis():
    store = DataStore.get_instance()
    df = store.get_data()

    # 1. Warehouses with coordinates and operational stats
    warehouses = []
    wh_grp = df.groupby(["warehouse_location", "warehouse_latitude", "warehouse_longitude"]).agg(
        deliveries=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_cost=("delivery_cost", "mean"),
        avg_profit=("net_profit", "mean")
    ).reset_index()

    for _, r in wh_grp.iterrows():
        deliv = int(r["deliveries"])
        warehouses.append({
            "name": r["warehouse_location"],
            "latitude": float(r["warehouse_latitude"]),
            "longitude": float(r["warehouse_longitude"]),
            "deliveries": deliv,
            "delay_rate": round((int(r["delayed"]) / deliv) * 100, 2),
            "avg_cost": round(float(r["avg_cost"]), 2),
            "avg_profit": round(float(r["avg_profit"]), 2)
        })

    # 2. Source Cities
    source_cities = []
    src_grp = df.groupby(["source_city", "source_latitude", "source_longitude"]).agg(
        origin_deliveries=("delivery_id", "count"),
        delayed=("delayed", "sum")
    ).reset_index()

    for _, r in src_grp.iterrows():
        cnt = int(r["origin_deliveries"])
        source_cities.append({
            "city": r["source_city"],
            "latitude": float(r["source_latitude"]),
            "longitude": float(r["source_longitude"]),
            "deliveries": cnt,
            "delay_rate": round((int(r["delayed"]) / cnt) * 100, 2)
        })

    # 3. Destination Cities
    destination_cities = []
    dest_grp = df.groupby(["destination_city", "destination_latitude", "destination_longitude"]).agg(
        inbound_deliveries=("delivery_id", "count"),
        delayed=("delayed", "sum")
    ).reset_index()

    for _, r in dest_grp.iterrows():
        cnt = int(r["inbound_deliveries"])
        destination_cities.append({
            "city": r["destination_city"],
            "latitude": float(r["destination_latitude"]),
            "longitude": float(r["destination_longitude"]),
            "deliveries": cnt,
            "delay_rate": round((int(r["delayed"]) / cnt) * 100, 2)
        })

    # 4. Regional Breakdown (20 regions)
    regions = []
    reg_grp = df.groupby(["region", "operational_zone", "region_latitude", "region_longitude"]).agg(
        deliveries=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_delivery_time=("delivery_time_hours", "mean"),
        avg_cost=("delivery_cost", "mean"),
        avg_profit=("net_profit", "mean"),
        avg_carbon=("carbon_emission_kg", "mean"),
        avg_road_quality=("road_quality_index", "mean")
    ).reset_index()

    for _, r in reg_grp.iterrows():
        deliv = int(r["deliveries"])
        regions.append({
            "region": r["region"],
            "zone": r["operational_zone"],
            "latitude": float(r["region_latitude"]),
            "longitude": float(r["region_longitude"]),
            "deliveries": deliv,
            "delay_rate": round((int(r["delayed"]) / deliv) * 100, 2),
            "avg_delivery_time": round(float(r["avg_delivery_time"]), 2),
            "avg_cost": round(float(r["avg_cost"]), 2),
            "avg_profit": round(float(r["avg_profit"]), 2),
            "avg_carbon": round(float(r["avg_carbon"]), 2),
            "avg_road_quality": round(float(r["avg_road_quality"]), 1)
        })

    # 5. Top Route Corridors (source -> destination)
    corridors = []
    corr_grp = df.groupby([
        "source_city", "source_latitude", "source_longitude",
        "destination_city", "destination_latitude", "destination_longitude"
    ]).agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_distance=("distance_km", "mean"),
        avg_time=("delivery_time_hours", "mean"),
        avg_cost=("delivery_cost", "mean"),
        avg_carbon=("carbon_emission_kg", "mean"),
        avg_deviation=("gps_route_deviation_km", "mean")
    ).reset_index().sort_values("volume", ascending=False)

    for _, r in corr_grp.head(25).iterrows():
        vol = int(r["volume"])
        corridors.append({
            "route": f"{r['source_city']} → {r['destination_city']}",
            "source_city": r["source_city"],
            "source_coords": [float(r["source_latitude"]), float(r["source_longitude"])],
            "destination_city": r["destination_city"],
            "destination_coords": [float(r["destination_latitude"]), float(r["destination_longitude"])],
            "volume": vol,
            "delay_rate": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_distance_km": round(float(r["avg_distance"]), 1),
            "avg_delivery_time_hours": round(float(r["avg_time"]), 1),
            "avg_cost": round(float(r["avg_cost"]), 2),
            "avg_carbon_kg": round(float(r["avg_carbon"]), 2),
            "avg_gps_deviation_km": round(float(r["avg_deviation"]), 2)
        })

    # 6. Route Type Comparison (Highway, Urban, Rural)
    route_types = []
    rt_grp = df.groupby("route_type").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_time=("delivery_time_hours", "mean"),
        avg_speed=("effective_speed_kmh", "mean"),
        avg_road_quality=("road_quality_index", "mean"),
        avg_stops=("number_of_stops", "mean"),
        avg_deviation=("gps_route_deviation_km", "mean")
    ).reset_index()

    for _, r in rt_grp.iterrows():
        vol = int(r["volume"])
        route_types.append({
            "route_type": r["route_type"],
            "volume": vol,
            "delay_rate": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_time_hours": round(float(r["avg_time"]), 2),
            "avg_speed_kmh": round(float(r["avg_speed"]), 2),
            "avg_road_quality": round(float(r["avg_road_quality"]), 1),
            "avg_stops": round(float(r["avg_stops"]), 2),
            "avg_deviation_km": round(float(r["avg_deviation"]), 2)
        })

    # 7. Multi-Stop Delay Impact
    stops_impact = []
    stop_grp = df.groupby("number_of_stops").agg(
        volume=("delivery_id", "count"),
        delayed=("delayed", "sum"),
        avg_time=("delivery_time_hours", "mean")
    ).reset_index().sort_values("number_of_stops")

    for _, r in stop_grp.iterrows():
        vol = int(r["volume"])
        stops_impact.append({
            "stops": int(r["number_of_stops"]),
            "volume": vol,
            "delay_rate": round((int(r["delayed"]) / vol) * 100, 2),
            "avg_time_hours": round(float(r["avg_time"]), 2)
        })

    return {
        "warehouses": warehouses,
        "source_cities": source_cities,
        "destination_cities": destination_cities,
        "regions": regions,
        "top_corridors": corridors,
        "route_type_comparison": route_types,
        "stops_impact": stops_impact
    }
