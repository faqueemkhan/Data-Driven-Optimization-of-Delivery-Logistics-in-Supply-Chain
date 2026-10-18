export interface HealthStatus {
  status: string;
  app_title: string;
  dataset_rows: number;
  ml_model_loaded: boolean;
  version: string;
}

export interface OverviewKPIs {
  total_deliveries: number;
  on_time_deliveries: number;
  delayed_deliveries: number;
  on_time_rate_pct: number;
  delay_rate_pct: number;
  avg_delivery_time_hours: number;
  avg_expected_time_hours: number;
  total_delivery_cost: number;
  avg_delivery_cost: number;
  total_fuel_cost: number;
  avg_fuel_cost: number;
  total_net_profit: number;
  avg_net_profit: number;
  total_carbon_emission_kg: number;
  total_carbon_emission_tonnes: number;
  avg_carbon_emission_kg: number;
}

export interface MonthlyTrend {
  month: string;
  deliveries: number;
  delayed: number;
  on_time: number;
  delay_rate: number;
  avg_cost: number;
  avg_profit: number;
  avg_emissions: number;
  avg_delivery_time: number;
}

export interface PartnerStat {
  partner: string;
  deliveries: number;
  delay_rate: number;
  avg_cost: number;
  avg_profit: number;
  avg_rating: number;
  avg_carbon: number;
}

export interface VehicleStat {
  vehicle_type: string;
  deliveries: number;
  delay_rate: number;
  avg_fuel_cost: number;
  avg_carbon: number;
  avg_capacity: number;
  is_ev: boolean;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  monthly_trends: MonthlyTrend[];
  partner_breakdown: PartnerStat[];
  vehicle_breakdown: VehicleStat[];
}

export interface ValidationRule {
  rule: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

export interface OutlierMetric {
  q1: number;
  q3: number;
  iqr: number;
  lower_bound: number;
  upper_bound: number;
  outlier_count: number;
  outlier_percentage: number;
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface QualityReport {
  dataset_name: string;
  generated_at: string;
  total_records: number;
  total_columns: number;
  duplicate_records: number;
  quality_score: number;
  metrics: {
    completeness_pct: number;
    uniqueness_pct: number;
    validity_pct: number;
  };
  missing_values: Record<string, number>;
  validation_results: ValidationRule[];
  outliers: Record<string, OutlierMetric>;
}

export interface MLMetrics {
  algorithm: string;
  model_type: string;
  training_samples: number;
  testing_samples: number;
  target_distribution: {
    on_time_0: number;
    delayed_1: number;
    delay_rate_pct: number;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  feature_importances: Array<{
    feature: string;
    importance: number;
    importance_pct: number;
  }>;
  detailed_top_features: Array<{
    feature: string;
    importance: number;
  }>;
  leakage_prevention: {
    status: string;
    excluded_features: string[];
  };
  categorical_options: Record<string, string[]>;
  numerical_ranges: Record<string, { min: number; max: number; mean: number; median: number }>;
}

export interface PredictionResult {
  delay_prediction: number;
  is_delayed: boolean;
  delay_probability: number;
  delay_probability_pct: number;
  risk_level: string;
  risk_color: string;
  contributing_factors: string[];
  actionable_mitigations: string[];
  leakage_safeguard: string;
}

export interface RouteCorridor {
  route: string;
  source_city: string;
  source_coords: [number, number];
  destination_city: string;
  destination_coords: [number, number];
  volume: number;
  delay_rate: number;
  avg_distance_km: number;
  avg_delivery_time_hours: number;
  avg_cost: number;
  avg_carbon_kg: number;
  avg_gps_deviation_km: number;
}

export interface GeoLocation {
  name?: string;
  city?: string;
  latitude: number;
  longitude: number;
  deliveries: number;
  delay_rate: number;
  avg_cost?: number;
  avg_profit?: number;
}

export interface RegionGeo {
  region: string;
  zone: string;
  latitude: number;
  longitude: number;
  deliveries: number;
  delay_rate: number;
  avg_delivery_time: number;
  avg_cost: number;
  avg_profit: number;
  avg_carbon: number;
  avg_road_quality: number;
}

export interface RouteTypeComp {
  route_type: string;
  volume: number;
  delay_rate: number;
  avg_time_hours: number;
  avg_speed_kmh: number;
  avg_road_quality: number;
  avg_stops: number;
  avg_deviation_km: number;
}

export interface RoutesGeoData {
  warehouses: GeoLocation[];
  source_cities: GeoLocation[];
  destination_cities: GeoLocation[];
  regions: RegionGeo[];
  top_corridors: RouteCorridor[];
  route_type_comparison: RouteTypeComp[];
  stops_impact: Array<{
    stops: number;
    volume: number;
    delay_rate: number;
    avg_time_hours: number;
  }>;
}

export interface PerformanceData {
  partner_performance: Array<{
    partner: string;
    deliveries: number;
    delay_count: number;
    on_time_count: number;
    delay_rate_pct: number;
    on_time_rate_pct: number;
    avg_cost: number;
    avg_fuel_cost: number;
    avg_profit: number;
    avg_rating: number;
    avg_penalty: number;
    avg_carbon_kg: number;
    avg_time_hours: number;
  }>;
  vehicle_performance: Array<{
    vehicle_type: string;
    is_ev: boolean;
    deliveries: number;
    delay_rate_pct: number;
    avg_fuel_cost: number;
    avg_carbon_kg: number;
    avg_capacity_pct: number;
    avg_weight_kg: number;
    avg_speed_kmh: number;
    avg_maintenance_score: number;
  }>;
  weather_impact: Array<{
    weather: string;
    deliveries: number;
    delay_rate_pct: number;
    avg_time_hours: number;
    avg_traffic_delay_mins: number;
    avg_severity_score: number;
    avg_gps_deviation_km: number;
  }>;
  traffic_impact: Array<{
    traffic_level: string;
    deliveries: number;
    delay_rate_pct: number;
    avg_traffic_delay_mins: number;
    avg_time_hours: number;
    avg_fuel_cost: number;
  }>;
  rush_hour_comparison?: Array<{
    traffic_level: string;
    rush_hour: string;
    volume: number;
    delay_rate_pct: number;
  }>;
}

export interface WhatIfSimulationResult {
  simulation_disclaimer: string;
  is_simulated: boolean;
  baseline: {
    estimated_delivery_time_hours: number;
    delay_risk_pct: number;
    delivery_cost: number;
    fuel_cost: number;
    carbon_emission_kg: number;
    effective_speed_kmh: number;
    is_ev: boolean;
  };
  scenario: {
    estimated_delivery_time_hours: number;
    delay_risk_pct: number;
    delivery_cost: number;
    fuel_cost: number;
    carbon_emission_kg: number;
    effective_speed_kmh: number;
    is_ev: boolean;
  };
  deltas: {
    time_difference_hours: number;
    delay_risk_diff_pct: number;
    cost_difference: number;
    fuel_difference: number;
    carbon_difference_kg: number;
  };
}

export interface OptimizationData {
  summary: {
    total_deliveries_analyzed: number;
    projected_annual_cost_savings: number;
    projected_carbon_reduction_tonnes: number;
    projected_delay_rate_reduction_pct: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    impact_metric: string;
    description: string;
    implementation_steps: string[];
  }>;
}

export interface DeliveryRecord {
  delivery_id: number;
  delivery_partner: string;
  package_type: string;
  vehicle_type: string;
  delivery_mode: string;
  region: string;
  weather_condition: string;
  distance_km: number;
  package_weight_kg: number;
  delivery_time_hours: number;
  expected_time_hours: number;
  delayed: number;
  delivery_status: string;
  delivery_cost: number;
  traffic_level: string;
  fuel_cost: number;
  delivery_priority: string;
  order_value: number;
  net_profit: number;
  carbon_emission_kg: number;
  source_city: string;
  destination_city: string;
  order_date?: string;
  is_ev?: number;
  time_variance_hours?: number;
  delay_severity?: string;
}

export interface DeliveriesResponse {
  page: number;
  page_size: number;
  total_matched: number;
  total_pages: number;
  records: DeliveryRecord[];
}

export interface FilterOptions {
  delivery_partners: string[];
  vehicle_types: string[];
  traffic_levels: string[];
  weather_conditions: string[];
  operational_zones: string[];
  delivery_modes: string[];
  delivery_priorities: string[];
  regions: string[];
  delay_statuses: Array<{ value: string; label: string }>;
}
