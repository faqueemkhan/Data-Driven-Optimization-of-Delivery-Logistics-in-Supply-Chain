"""
Module 8: Deliveries Explorer, Searchable Tables, Dynamic Filters and CSV Export API Route.
"""

from io import StringIO
from typing import Optional, List
import pandas as pd
from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse
from app.data_store import DataStore

router = APIRouter(prefix="/deliveries", tags=["Deliveries Explorer & Export"])

@router.get("/filters-options")
def get_filter_options():
    store = DataStore.get_instance()
    df = store.get_data()

    return {
        "delivery_partners": sorted([str(x) for x in df["delivery_partner"].dropna().unique().tolist()]),
        "vehicle_types": sorted([str(x) for x in df["vehicle_type"].dropna().unique().tolist()]),
        "traffic_levels": ["Low", "Medium", "High", "Severe"],
        "weather_conditions": sorted([str(x) for x in df["weather_condition"].dropna().unique().tolist()]),
        "operational_zones": sorted([str(x) for x in df["operational_zone"].dropna().unique().tolist()]),
        "delivery_modes": sorted([str(x) for x in df["delivery_mode"].dropna().unique().tolist()]),
        "delivery_priorities": ["Critical", "High", "Medium", "Low"],
        "regions": sorted([str(x) for x in df["region"].dropna().unique().tolist()]),
        "delay_statuses": [
            {"value": "all", "label": "All Deliveries"},
            {"value": "0", "label": "On-Time Only"},
            {"value": "1", "label": "Delayed Only"}
        ]
    }

def apply_filters(
    df: pd.DataFrame,
    search: Optional[str] = None,
    partner: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    traffic: Optional[str] = None,
    weather: Optional[str] = None,
    zone: Optional[str] = None,
    delayed: Optional[str] = None,
    delivery_mode: Optional[str] = None,
    priority: Optional[str] = None,
    region: Optional[str] = None,
) -> pd.DataFrame:
    filtered = df.copy()

    if search:
        s = search.strip().lower()
        id_match = filtered["delivery_id"].astype(str).str.contains(s, case=False, na=False)
        src_match = filtered["source_city"].astype(str).str.lower().str.contains(s, na=False)
        dest_match = filtered["destination_city"].astype(str).str.lower().str.contains(s, na=False)
        reg_match = filtered["region"].astype(str).str.lower().str.contains(s, na=False)
        part_match = filtered["delivery_partner"].astype(str).str.lower().str.contains(s, na=False)
        filtered = filtered[id_match | src_match | dest_match | reg_match | part_match]

    if partner and partner != "all":
        filtered = filtered[filtered["delivery_partner"].str.lower() == partner.lower()]

    if vehicle_type and vehicle_type != "all":
        filtered = filtered[filtered["vehicle_type"].str.lower() == vehicle_type.lower()]

    if traffic and traffic != "all":
        filtered = filtered[filtered["traffic_level"].str.lower() == traffic.lower()]

    if weather and weather != "all":
        filtered = filtered[filtered["weather_condition"].str.lower() == weather.lower()]

    if zone and zone != "all":
        filtered = filtered[filtered["operational_zone"].str.lower() == zone.lower()]

    if region and region != "all":
        filtered = filtered[filtered["region"].str.lower() == region.lower()]

    if delivery_mode and delivery_mode != "all":
        filtered = filtered[filtered["delivery_mode"].str.lower() == delivery_mode.lower()]

    if priority and priority != "all":
        filtered = filtered[filtered["delivery_priority"].str.lower() == priority.lower()]

    if delayed and delayed in ["0", "1"]:
        filtered = filtered[filtered["delayed"] == int(delayed)]

    return filtered

@router.get("/")
def list_deliveries(
    search: Optional[str] = None,
    partner: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    traffic: Optional[str] = None,
    weather: Optional[str] = None,
    zone: Optional[str] = None,
    region: Optional[str] = None,
    delayed: Optional[str] = None,
    delivery_mode: Optional[str] = None,
    priority: Optional[str] = None,
    sort_by: str = Query("delivery_id", pattern="^[a-zA-Z0-9_]+$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100)
):
    store = DataStore.get_instance()
    df = store.get_data()

    filtered = apply_filters(
        df=df,
        search=search,
        partner=partner,
        vehicle_type=vehicle_type,
        traffic=traffic,
        weather=weather,
        zone=zone,
        region=region,
        delayed=delayed,
        delivery_mode=delivery_mode,
        priority=priority
    )

    total_matched = len(filtered)

    # Sorting
    if sort_by in filtered.columns:
        ascending = (sort_order.lower() == "asc")
        filtered = filtered.sort_values(sort_by, ascending=ascending)

    # Pagination
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_items = filtered.iloc[start_idx:end_idx]

    records = page_items.to_dict(orient="records")

    total_pages = max(1, (total_matched + page_size - 1) // page_size)

    return {
        "page": page,
        "page_size": page_size,
        "total_matched": total_matched,
        "total_pages": total_pages,
        "records": records
    }

@router.get("/export")
def export_deliveries_csv(
    search: Optional[str] = None,
    partner: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    traffic: Optional[str] = None,
    weather: Optional[str] = None,
    zone: Optional[str] = None,
    region: Optional[str] = None,
    delayed: Optional[str] = None,
    delivery_mode: Optional[str] = None,
    priority: Optional[str] = None
):
    store = DataStore.get_instance()
    df = store.get_data()

    filtered = apply_filters(
        df=df,
        search=search,
        partner=partner,
        vehicle_type=vehicle_type,
        traffic=traffic,
        weather=weather,
        zone=zone,
        region=region,
        delayed=delayed,
        delivery_mode=delivery_mode,
        priority=priority
    )

    # Convert to CSV buffer
    csv_buffer = StringIO()
    filtered.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    filename = f"logistics_deliveries_export_{len(filtered)}_records.csv"

    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
