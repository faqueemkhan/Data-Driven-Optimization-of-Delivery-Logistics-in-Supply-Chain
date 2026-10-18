"""
Data Store & Model Cache for Logistics Optimization Backend.
Loads cleaned data, quality report, and ML pipeline in-memory with thread-safe caching.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
import pandas as pd
import joblib

logger = logging.getLogger("DataStore")

class DataStore:
    _instance: Optional["DataStore"] = None

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.cleaned_csv_path = os.path.join(self.base_dir, "data", "cleaned", "Logistics_Delivery_Cleaned.csv")
        self.raw_csv_path = os.path.join(self.base_dir, "data", "raw", "Logistics_Delivery_Dataset_with_coords.csv")
        self.quality_report_path = os.path.join(self.base_dir, "data", "cleaned", "data_quality_report.json")
        self.model_path = os.path.join(self.base_dir, "ml", "models", "delay_classifier.joblib")
        self.model_metadata_path = os.path.join(self.base_dir, "ml", "models", "model_metadata.json")

        self.df: Optional[pd.DataFrame] = None
        self.quality_report: Optional[Dict[str, Any]] = None
        self.ml_pipeline = None
        self.model_metadata: Optional[Dict[str, Any]] = None

        self.load_all()

    @classmethod
    def get_instance(cls) -> "DataStore":
        if cls._instance is None:
            cls._instance = DataStore()
        return cls._instance

    def load_all(self):
        # 1. Load Cleaned Dataset
        if os.path.exists(self.cleaned_csv_path):
            logger.info(f"Loading cleaned dataset from {self.cleaned_csv_path}...")
            self.df = pd.read_csv(self.cleaned_csv_path)
            logger.info(f"Loaded {len(self.df)} records and {len(self.df.columns)} columns.")
        else:
            logger.warning(f"Cleaned CSV not found at {self.cleaned_csv_path}. Attempting raw fallback.")
            if os.path.exists(self.raw_csv_path):
                self.df = pd.read_csv(self.raw_csv_path)

        # 2. Load Quality Report
        if os.path.exists(self.quality_report_path):
            with open(self.quality_report_path, "r", encoding="utf-8") as f:
                self.quality_report = json.load(f)

        # 3. Load Trained Model
        if os.path.exists(self.model_path):
            logger.info(f"Loading ML pipeline from {self.model_path}...")
            self.ml_pipeline = joblib.load(self.model_path)

        # 4. Load Model Metadata
        if os.path.exists(self.model_metadata_path):
            with open(self.model_metadata_path, "r", encoding="utf-8") as f:
                self.model_metadata = json.load(f)

    def get_data(self) -> pd.DataFrame:
        if self.df is None:
            self.load_all()
        return self.df

    def get_quality_report(self) -> Dict[str, Any]:
        if self.quality_report is None:
            self.load_all()
        return self.quality_report or {}

    def get_model(self):
        if self.ml_pipeline is None:
            self.load_all()
        return self.ml_pipeline

    def get_model_metadata(self) -> Dict[str, Any]:
        if self.model_metadata is None:
            self.load_all()
        return self.model_metadata or {}
