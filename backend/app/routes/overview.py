"""
Module 1: Overview Dashboard API Route
Delivers key logistical KPIs: deliveries, on-time rate, delay rate, cost, profit, emissions, trends.
"""

from fastapi import APIRouter
from app.data_store import DataStore

router = APIRouter(prefix="/overview", tags=["Overview"])

@router.get("/")
def get_overview_dashboard():
    store = DataStore.get_instance()
    cached = store.get_cached("overview")
    if cached is not None:
        return cached

    df = store.get_data()

    total_deliveries = int(len(df))
    delayed_count = int((df["delayed"] == 1).sum())
    on_time_count = total_deliveries - delayed_count

    on_time_rate = round((on_time_count / total_deliveries) * 100, 2)
    delay_rate = round((delayed_count / total_deliveries) * 100, 2)

    avg_delivery_time = round(float(df["delivery_time_hours"].mean()), 2)
    avg_expected_time = round(float(df["expected_time_hours"].mean()), 2)

    total_delivery_cost = round(float(df["delivery_cost"].sum()), 2)
    avg_delivery_cost = round(float(df["delivery_cost"].mean()), 2)

    total_fuel_cost = round(float(df["fuel_cost"].sum()), 2)
    avg_fuel_cost = round(float(df["fuel_cost"].mean()), 2)

    total_net_profit = round(float(df["net_profit"].sum()), 2)
    avg_net_profit = round(float(df["net_profit"].mean()), 2)

    total_carbon_emission_kg = round(float(df["carbon_emission_kg"].sum()), 2)
    total_carbon_emission_tonnes = round(total_carbon_emission_kg / 1000.0, 2)
    avg_carbon_emission_kg = round(float(df["carbon_emission_kg"].mean()), 2)

    # Monthly trends
    month_order = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    monthly_stats = []
    if "order_month" in df.columns:
        grouped_month = df.groupby("order_month").agg(
            total_deliveries=("delivery_id", "count"),
            delayed_count=("delayed", "sum"),
            avg_cost=("delivery_cost", "mean"),
            avg_profit=("net_profit", "mean"),
            avg_emissions=("carbon_emission_kg", "mean"),
            avg_delivery_time=("delivery_time_hours", "mean")
        ).reset_index()

        grouped_month["month_sort"] = grouped_month["order_month"].apply(
            lambda m: month_order.index(m) if m in month_order else 99
        )
        grouped_month = grouped_month.sort_values("month_sort")

        for _, row in grouped_month.iterrows():
            d_count = int(row["delayed_count"])
            t_count = int(row["total_deliveries"])
            monthly_stats.append({
                "month": row["order_month"],
                "deliveries": t_count,
                "delayed": d_count,
                "on_time": t_count - d_count,
                "delay_rate": round((d_count / t_count) * 100, 2),
                "avg_cost": round(float(row["avg_cost"]), 2),
                "avg_profit": round(float(row["avg_profit"]), 2),
                "avg_emissions": round(float(row["avg_emissions"]), 2),
                "avg_delivery_time": round(float(row["avg_delivery_time"]), 2)
            })

    # Partner breakdown
    partner_stats = []
    if "delivery_partner" in df.columns:
        p_grp = df.groupby("delivery_partner").agg(
            deliveries=("delivery_id", "count"),
            delayed=("delayed", "sum"),
            avg_cost=("delivery_cost", "mean"),
            avg_profit=("net_profit", "mean"),
            avg_rating=("delivery_rating", "mean"),
            avg_carbon=("carbon_emission_kg", "mean")
        ).reset_index()
        for _, row in p_grp.iterrows():
            deliv = int(row["deliveries"])
            del_cnt = int(row["delayed"])
            partner_stats.append({
                "partner": row["delivery_partner"],
                "deliveries": deliv,
                "delay_rate": round((del_cnt / deliv) * 100, 2),
                "avg_cost": round(float(row["avg_cost"]), 2),
                "avg_profit": round(float(row["avg_profit"]), 2),
                "avg_rating": round(float(row["avg_rating"]), 2),
                "avg_carbon": round(float(row["avg_carbon"]), 2)
            })

    # Vehicle breakdown
    vehicle_stats = []
    if "vehicle_type" in df.columns:
        v_grp = df.groupby("vehicle_type").agg(
            deliveries=("delivery_id", "count"),
            delayed=("delayed", "sum"),
            avg_fuel_cost=("fuel_cost", "mean"),
            avg_carbon=("carbon_emission_kg", "mean"),
            avg_capacity=("vehicle_capacity_utilization", "mean")
        ).reset_index()
        for _, row in v_grp.iterrows():
            deliv = int(row["deliveries"])
            vehicle_stats.append({
                "vehicle_type": row["vehicle_type"],
                "deliveries": deliv,
                "delay_rate": round((int(row["delayed"]) / deliv) * 100, 2),
                "avg_fuel_cost": round(float(row["avg_fuel_cost"]), 2),
                "avg_carbon": round(float(row["avg_carbon"]), 2),
                "avg_capacity": round(float(row["avg_capacity"]), 2),
                "is_ev": "ev" in str(row["vehicle_type"]).lower()
            })

    # Priority distribution
    priority_stats = []
    if "delivery_priority" in df.columns:
        pr_grp = df.groupby("delivery_priority").agg(
            count=("delivery_id", "count"),
            delayed=("delayed", "sum")
        ).reset_index()
        for _, row in pr_grp.iterrows():
            cnt = int(row["count"])
            priority_stats.append({
                "priority": row["delivery_priority"],
                "deliveries": cnt,
                "delayed": int(row["delayed"]),
                "delay_rate": round((int(row["delayed"]) / cnt) * 100, 2)
            })

    result = {
        "kpis": {
            "total_deliveries": total_deliveries,
            "on_time_deliveries": on_time_count,
            "delayed_deliveries": delayed_count,
            "on_time_rate_pct": on_time_rate,
            "delay_rate_pct": delay_rate,
            "avg_delivery_time_hours": avg_delivery_time,
            "avg_expected_time_hours": avg_expected_time,
            "total_delivery_cost": total_delivery_cost,
            "avg_delivery_cost": avg_delivery_cost,
            "total_fuel_cost": total_fuel_cost,
            "avg_fuel_cost": avg_fuel_cost,
            "total_net_profit": total_net_profit,
            "avg_net_profit": avg_net_profit,
            "total_carbon_emission_kg": total_carbon_emission_kg,
            "total_carbon_emission_tonnes": total_carbon_emission_tonnes,
            "avg_carbon_emission_kg": avg_carbon_emission_kg
        },
        "monthly_trends": monthly_stats,
        "partner_breakdown": partner_stats,
        "vehicle_breakdown": vehicle_stats,
        "priority_distribution": priority_stats
    }

    store.set_cached("overview", result)
    return result
