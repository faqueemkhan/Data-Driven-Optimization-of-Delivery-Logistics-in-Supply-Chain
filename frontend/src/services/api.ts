import {
  HealthStatus,
  OverviewData,
  QualityReport,
  MLMetrics,
  PredictionResult,
  RoutesGeoData,
  PerformanceData,
  WhatIfSimulationResult,
  OptimizationData,
  DeliveriesResponse,
  FilterOptions
} from '../types';

const BASE_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${BASE_HOST}/api`;

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${BASE_HOST}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getOverview(): Promise<OverviewData> {
    const res = await fetch(`${API_BASE}/overview/`);
    if (!res.ok) throw new Error('Failed to load overview data');
    return res.json();
  },

  async getQualityReport(): Promise<QualityReport> {
    const res = await fetch(`${API_BASE}/quality/`);
    if (!res.ok) throw new Error('Failed to load data quality report');
    return res.json();
  },

  async getMLMetrics(): Promise<MLMetrics> {
    const res = await fetch(`${API_BASE}/prediction/metrics`);
    if (!res.ok) throw new Error('Failed to load ML model metrics');
    return res.json();
  },

  async predictDelay(payload: any): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE}/prediction/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async getRoutesGeo(): Promise<RoutesGeoData> {
    const res = await fetch(`${API_BASE}/routes-geo/`);
    if (!res.ok) throw new Error('Failed to load route and regional geographic data');
    return res.json();
  },

  async getPerformance(): Promise<PerformanceData> {
    const res = await fetch(`${API_BASE}/performance/`);
    if (!res.ok) throw new Error('Failed to load logistics performance analytics');
    return res.json();
  },

  async runWhatIfSimulation(payload: any): Promise<WhatIfSimulationResult> {
    const res = await fetch(`${API_BASE}/whatif/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to run what-if simulation');
    return res.json();
  },

  async getOptimization(): Promise<OptimizationData> {
    const res = await fetch(`${API_BASE}/optimization/`);
    if (!res.ok) throw new Error('Failed to load optimization recommendations');
    return res.json();
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const res = await fetch(`${API_BASE}/deliveries/filters-options`);
    if (!res.ok) throw new Error('Failed to load filter options');
    return res.json();
  },

  async getDeliveries(params: Record<string, any>): Promise<DeliveriesResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, String(value));
      }
    });
    const res = await fetch(`${API_BASE}/deliveries/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load deliveries table');
    return res.json();
  },

  getExportUrl(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.append(key, String(value));
      }
    });
    return `${API_BASE}/deliveries/export?${query.toString()}`;
  }
};
