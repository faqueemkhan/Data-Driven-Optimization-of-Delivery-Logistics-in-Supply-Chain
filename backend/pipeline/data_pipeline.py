"""
Data-Driven Optimization of Delivery Logistics in Supply Chain
Automated Data Pipeline: Cleaning, Preprocessing, Validation, Feature Engineering, Quality Reporting.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DataPipeline")

class LogisticsDataPipeline:
    def __init__(self, raw_data_path: str, cleaned_data_path: str, quality_report_path: str):
        self.raw_data_path = raw_data_path
        self.cleaned_data_path = cleaned_data_path
        self.quality_report_path = quality_report_path

    def run(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes full automated pipeline while preserving raw dataset."""
        logger.info(f"Loading raw dataset from {self.raw_data_path}...")
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Raw data file not found: {self.raw_data_path}")

        raw_df = pd.read_csv(self.raw_data_path)
        logger.info(f"Raw dataset loaded. Shape: {raw_df.shape}")

        # Step 1: Initial Validation & Profiling
        quality_report = self._profile_data(raw_df)

        # Step 2: Data Cleaning & Preprocessing
        cleaned_df = self._clean_and_preprocess(raw_df, quality_report)

        # Step 3: Feature Engineering
        featured_df = self._engineer_features(cleaned_df)

        # Step 4: Final Validation
        self._validate_cleaned_data(featured_df, quality_report)

        # Step 5: Save Cleaned Dataset Separately
        os.makedirs(os.path.dirname(self.cleaned_data_path), exist_ok=True)
        featured_df.to_csv(self.cleaned_data_path, index=False)
        logger.info(f"Cleaned dataset saved to {self.cleaned_data_path} (Shape: {featured_df.shape})")

        # Step 6: Save Data Quality Report
        os.makedirs(os.path.dirname(self.quality_report_path), exist_ok=True)
        with open(self.quality_report_path, "w", encoding="utf-8") as f:
            json.dump(quality_report, f, indent=2, default=str)
        logger.info(f"Data quality report saved to {self.quality_report_path}")

        return featured_df, quality_report

    def _profile_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Profiles missing values, duplicates, outliers, and schema."""
        logger.info("Profiling dataset for quality report...")
        total_rows, total_cols = df.shape
        null_counts = df.isnull().sum().to_dict()
        duplicates = int(df.duplicated().sum())

        # Check unique IDs
        unique_ids = int(df["delivery_id"].nunique()) if "delivery_id" in df.columns else total_rows
        id_duplicates = total_rows - unique_ids

        # Outlier detection using IQR
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        outliers_info = {}
        for col in numeric_cols:
            q1 = float(df[col].quantile(0.25))
            q3 = float(df[col].quantile(0.75))
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outlier_count = int(((df[col] < lower_bound) | (df[col] > upper_bound)).sum())
            outliers_info[col] = {
                "q1": round(q1, 3),
                "q3": round(q3, 3),
                "iqr": round(iqr, 3),
                "lower_bound": round(lower_bound, 3),
                "upper_bound": round(upper_bound, 3),
                "outlier_count": outlier_count,
                "outlier_percentage": round((outlier_count / total_rows) * 100, 2),
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": round(float(df[col].mean()), 3),
                "std": round(float(df[col].std()), 3) if not np.isnan(df[col].std()) else 0
            }

        # Validation checks
        validation_results = []

        # Rule 1: Non-null delivery IDs
        rule_1_pass = bool(null_counts.get("delivery_id", 0) == 0)
        validation_results.append({
            "rule": "Unique & Non-Null Delivery IDs",
            "status": "PASS" if rule_1_pass and id_duplicates == 0 else "FAIL",
            "details": f"{id_duplicates} duplicate IDs, {null_counts.get('delivery_id', 0)} nulls"
        })

        # Rule 2: Positive distance and weights
        invalid_distances = int((df["distance_km"] <= 0).sum()) if "distance_km" in df.columns else 0
        invalid_weights = int((df["package_weight_kg"] <= 0).sum()) if "package_weight_kg" in df.columns else 0
        validation_results.append({
            "rule": "Positive Operational Metrics (Distance & Weight)",
            "status": "PASS" if invalid_distances == 0 and invalid_weights == 0 else "WARN",
            "details": f"{invalid_distances} non-positive distances, {invalid_weights} non-positive weights"
        })

        # Rule 3: Valid target binary variable
        delayed_valid = set(df["delayed"].unique()).issubset({0, 1}) if "delayed" in df.columns else False
        validation_results.append({
            "rule": "Binary Target Encoding for Delayed Flag",
            "status": "PASS" if delayed_valid else "FAIL",
            "details": f"Target values: {list(df['delayed'].unique()) if 'delayed' in df.columns else 'Missing'}"
        })

        # Rule 4: GPS Coordinates Range
        gps_valid = True
        if "source_latitude" in df.columns and "source_longitude" in df.columns:
            invalid_coords = (
                (df["source_latitude"] < -90) | (df["source_latitude"] > 90) |
                (df["source_longitude"] < -180) | (df["source_longitude"] > 180) |
                (df["destination_latitude"] < -90) | (df["destination_latitude"] > 90) |
                (df["destination_longitude"] < -180) | (df["destination_longitude"] > 180)
            ).sum()
            if invalid_coords > 0:
                gps_valid = False
            validation_results.append({
                "rule": "GPS Coordinates In Geographic Range",
                "status": "PASS" if gps_valid else "FAIL",
                "details": f"{int(invalid_coords)} rows out of geo bounds"
            })

        # Rule 5: Ratings in [1, 5]
        rating_valid = True
        for r_col in ["delivery_rating", "customer_satisfaction_score", "driver_rating"]:
            if r_col in df.columns:
                out_of_bounds = ((df[r_col] < 1.0) | (df[r_col] > 5.0)).sum()
                if out_of_bounds > 0:
                    rating_valid = False
        validation_results.append({
            "rule": "Rating Scores Within 1.0 - 5.0 Range",
            "status": "PASS" if rating_valid else "WARN",
            "details": "All customer and driver ratings evaluated"
        })

        # Rule 6: Percentages / Index scales [0, 100]
        scale_valid = True
        for s_col in ["road_quality_index", "vehicle_capacity_utilization", "maintenance_score"]:
            if s_col in df.columns:
                out_bounds = ((df[s_col] < 0) | (df[s_col] > 100)).sum()
                if out_bounds > 0:
                    scale_valid = False
        validation_results.append({
            "rule": "Bounded Indices (Road Quality, Utilization, Maintenance)",
            "status": "PASS" if scale_valid else "WARN",
            "details": "Indices fall within bounded [0, 100] scale"
        })

        # Composite Quality Score Calculation (completeness, uniqueness, validity)
        completeness = 100.0 - (sum(null_counts.values()) / (total_rows * total_cols) * 100)
        uniqueness = 100.0 - (duplicates / total_rows * 100)
        validity = (sum(1 for r in validation_results if r["status"] == "PASS") / len(validation_results)) * 100
        quality_score = round(0.4 * completeness + 0.3 * uniqueness + 0.3 * validity, 2)

        return {
            "dataset_name": "Logistics_Delivery_Dataset_with_coords",
            "generated_at": datetime.now().isoformat(),
            "total_records": total_rows,
            "total_columns": total_cols,
            "duplicate_records": duplicates,
            "quality_score": quality_score,
            "metrics": {
                "completeness_pct": round(completeness, 2),
                "uniqueness_pct": round(uniqueness, 2),
                "validity_pct": round(validity, 2)
            },
            "missing_values": {k: int(v) for k, v in null_counts.items() if v > 0},
            "missing_values_summary": {
                "columns_with_missing": sum(1 for v in null_counts.values() if v > 0),
                "total_missing_cells": sum(null_counts.values())
            },
            "validation_results": validation_results,
            "outliers": outliers_info,
            "schema": {col: str(df[col].dtype) for col in df.columns}
        }

    def _clean_and_preprocess(self, df: pd.DataFrame, report: Dict[str, Any]) -> pd.DataFrame:
        """Cleans, formats, and standardizes records."""
        logger.info("Cleaning and standardizing fields...")
        cleaned = df.copy()

        # Trim and normalize string fields
        str_cols = cleaned.select_dtypes(include=["object"]).columns
        for col in str_cols:
            if "date" not in col:
                cleaned[col] = cleaned[col].astype(str).str.strip()

        # Parse dates robustly
        for date_col in ["order_date", "pickup_date", "delivery_date"]:
            if date_col in cleaned.columns:
                cleaned[date_col] = pd.to_datetime(cleaned[date_col], format="%d-%m-%Y %H:%M", errors="coerce")

        return cleaned

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineers domain-relevant features for supply chain optimization."""
        logger.info("Engineering supply chain and route features...")
        feat = df.copy()

        # Operational time intervals in hours
        if "pickup_date" in feat.columns and "order_date" in feat.columns:
            feat["order_to_pickup_hours"] = (feat["pickup_date"] - feat["order_date"]).dt.total_seconds() / 3600.0
            feat["order_to_pickup_hours"] = feat["order_to_pickup_hours"].fillna(0).round(2)

        if "delivery_date" in feat.columns and "pickup_date" in feat.columns:
            feat["pickup_to_delivery_hours"] = (feat["delivery_date"] - feat["pickup_date"]).dt.total_seconds() / 3600.0
            feat["pickup_to_delivery_hours"] = feat["pickup_to_delivery_hours"].fillna(feat["delivery_time_hours"]).round(2)

        # Delivery time variance: delivery_time_hours - expected_time_hours
        feat["time_variance_hours"] = (feat["delivery_time_hours"] - feat["expected_time_hours"]).round(2)

        # Efficiency & unit economics metrics
        feat["cost_per_km"] = (feat["delivery_cost"] / feat["distance_km"]).round(2)
        feat["fuel_cost_per_km"] = (feat["fuel_cost"] / feat["distance_km"]).round(2)
        feat["carbon_per_km"] = (feat["carbon_emission_kg"] / feat["distance_km"]).round(4)
        feat["profit_per_km"] = (feat["net_profit"] / feat["distance_km"]).round(2)

        # EV Classification
        feat["is_ev"] = feat["vehicle_type"].str.lower().str.contains("ev").astype(int)

        # Effective transit speed
        feat["effective_speed_kmh"] = (feat["distance_km"] / feat["delivery_time_hours"]).round(2)

        # Route corridor identifier
        feat["route_corridor"] = feat["source_city"] + " -> " + feat["destination_city"]

        # Delay Severity Categories
        def categorize_delay(row):
            if row["delayed"] == 0:
                return "On-Time"
            variance = row["time_variance_hours"]
            if variance <= 1.0:
                return "Minor Delay (<1h)"
            elif variance <= 4.0:
                return "Moderate Delay (1-4h)"
            else:
                return "Severe Delay (>4h)"

        feat["delay_severity"] = feat.apply(categorize_delay, axis=1)

        # Convert datetimes back to ISO-8601 strings for portable CSV & JSON delivery
        for date_col in ["order_date", "pickup_date", "delivery_date"]:
            if date_col in feat.columns:
                feat[date_col] = feat[date_col].dt.strftime("%Y-%m-%d %H:%M")

        return feat

    def _validate_cleaned_data(self, df: pd.DataFrame, report: Dict[str, Any]):
        """Verifies integrity of transformed dataset."""
        logger.info("Validating transformed dataset...")
        assert len(df) == report["total_records"], "Transformed dataset row count does not match original."
        assert "time_variance_hours" in df.columns, "Engineered feature time_variance_hours missing."
        assert "is_ev" in df.columns, "Engineered feature is_ev missing."
        logger.info("All post-cleaning validations passed successfully.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_path = os.path.join(base_dir, "data", "raw", "Logistics_Delivery_Dataset_with_coords.csv")
    cleaned_path = os.path.join(base_dir, "data", "cleaned", "Logistics_Delivery_Cleaned.csv")
    report_path = os.path.join(base_dir, "data", "cleaned", "data_quality_report.json")

    pipeline = LogisticsDataPipeline(raw_path, cleaned_path, report_path)
    cleaned_df, report = pipeline.run()
    print("Pipeline Execution Completed Successfully!")
    print(f"Data Quality Score: {report['quality_score']}%")
    print(f"Cleaned Dataset Columns: {len(cleaned_df.columns)}")
