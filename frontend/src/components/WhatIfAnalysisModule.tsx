import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Clock,
  IndianRupee,
  Leaf,
  Fuel,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { WhatIfSimulationResult } from '../types';
import { api } from '../services/api';

export const WhatIfAnalysisModule: React.FC = () => {
  const [params, setParams] = useState({
    base_distance_km: 150,
    base_traffic_level: 'Medium',
    base_weather_condition: 'clear',
    base_vehicle_type: 'truck',
    base_stops: 2,
    base_rush_hour: 'No',
    base_partner: 'delhivery',

    scenario_distance_km: 150,
    scenario_traffic_level: 'High',
    scenario_weather_condition: 'rainy',
    scenario_vehicle_type: 'ev van',
    scenario_stops: 1,
    scenario_rush_hour: 'No',
    scenario_partner: 'delhivery'
  });

  const [simResult, setSimResult] = useState<WhatIfSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runWhatIfSimulation(params);
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [params]);

  return (
    <div className="space-y-6">
      {/* Simulation Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4.5 text-xs text-amber-200 flex items-start space-x-3 shadow-lg">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
            Simulated Scenario Environment
          </div>
          <p className="mt-0.5 text-amber-200/90 leading-relaxed">
            What-If projections are simulated using our trained Random Forest delay classifier combined with empirical supply chain physics formulas. No synthetic live GPS tracking or simulated physical road sensors are fabricated; all calculations represent model projections.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5 w-max">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Interactive Scenario Modeler</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            What-If Supply Chain Parameter Simulator
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Simulate and compare how altering vehicle modality, route distance, traffic levels, and weather severity impacts transit duration, delay risk, operating costs, and carbon emissions.
          </p>
        </div>
      </div>

      {/* Control Sliders & Overrides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline Scenario Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <span>Baseline Dispatch Reference</span>
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Current Ops
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Route Distance:</span>
                <span className="font-mono text-white font-bold">{params.base_distance_km} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={params.base_distance_km}
                onChange={(e) => setParams({ ...params, base_distance_km: Number(e.target.value) })}
                className="w-full accent-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle Modality</label>
                <select
                  value={params.base_vehicle_type}
                  onChange={(e) => setParams({ ...params, base_vehicle_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="truck">Diesel Truck</option>
                  <option value="van">Diesel Van</option>
                  <option value="bike">Motorbike</option>
                  <option value="ev van">Electric Van (EV)</option>
                  <option value="ev bike">Electric Bike (EV)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Traffic Condition</label>
                <select
                  value={params.base_traffic_level}
                  onChange={(e) => setParams({ ...params, base_traffic_level: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Weather Condition</label>
                <select
                  value={params.base_weather_condition}
                  onChange={(e) => setParams({ ...params, base_weather_condition: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                >
                  <option value="clear">Clear</option>
                  <option value="cold">Cold</option>
                  <option value="hot">Hot</option>
                  <option value="rainy">Rainy</option>
                  <option value="foggy">Foggy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Intermediate Stops: {params.base_stops}</label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={params.base_stops}
                  onChange={(e) => setParams({ ...params, base_stops: Number(e.target.value) })}
                  className="w-full accent-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* What-If Scenario Form */}
        <div className="bg-slate-900/80 border border-brand-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold text-brand-300 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
              <span>Proposed What-If Simulation</span>
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Simulation Model
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Proposed Distance:</span>
                <span className="font-mono text-brand-400 font-bold">{params.scenario_distance_km} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={params.scenario_distance_km}
                onChange={(e) => setParams({ ...params, scenario_distance_km: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Proposed Vehicle</label>
                <select
                  value={params.scenario_vehicle_type}
                  onChange={(e) => setParams({ ...params, scenario_vehicle_type: e.target.value })}
                  className="w-full bg-slate-800 border border-brand-500/40 rounded-lg px-2.5 py-1.5 text-brand-200"
                >
                  <option value="ev van">Electric Van (EV)</option>
                  <option value="ev bike">Electric Bike (EV)</option>
                  <option value="van">Diesel Van</option>
                  <option value="truck">Diesel Truck</option>
                  <option value="bike">Motorbike</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proposed Traffic</label>
                <select
                  value={params.scenario_traffic_level}
                  onChange={(e) => setParams({ ...params, scenario_traffic_level: e.target.value })}
                  className="w-full bg-slate-800 border border-brand-500/40 rounded-lg px-2.5 py-1.5 text-brand-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Proposed Weather</label>
                <select
                  value={params.scenario_weather_condition}
                  onChange={(e) => setParams({ ...params, scenario_weather_condition: e.target.value })}
                  className="w-full bg-slate-800 border border-brand-500/40 rounded-lg px-2.5 py-1.5 text-brand-200"
                >
                  <option value="clear">Clear</option>
                  <option value="cold">Cold</option>
                  <option value="hot">Hot</option>
                  <option value="rainy">Rainy</option>
                  <option value="foggy">Foggy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proposed Stops: {params.scenario_stops}</label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={params.scenario_stops}
                  onChange={(e) => setParams({ ...params, scenario_stops: Number(e.target.value) })}
                  className="w-full accent-brand-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Simulation Results */}
      {simResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Comparative Outcome Telemetry</h3>
              <p className="text-xs text-slate-400">Baseline vs Proposed What-If Configuration</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                Baseline
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
              <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold">
                Simulation Projection
              </span>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Delivery Time */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimated Time</span>
                <Clock className="h-4 w-4 text-brand-400" />
              </div>
              <div className="my-2">
                <div className="text-sm text-slate-400 font-mono">
                  Base: {simResult.baseline.estimated_delivery_time_hours} hrs
                </div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {simResult.scenario.estimated_delivery_time_hours} hrs
                </div>
              </div>
              <div
                className={`text-xs font-semibold flex items-center space-x-1 ${
                  simResult.deltas.time_difference_hours <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simResult.deltas.time_difference_hours <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                <span>
                  {simResult.deltas.time_difference_hours > 0 ? '+' : ''}
                  {simResult.deltas.time_difference_hours} hrs ({simResult.deltas.time_difference_hours <= 0 ? 'Faster' : 'Slower'})
                </span>
              </div>
            </div>

            {/* Delay Risk */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Delay Probability</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-sm text-slate-400 font-mono">
                  Base: {simResult.baseline.delay_risk_pct}%
                </div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {simResult.scenario.delay_risk_pct}%
                </div>
              </div>
              <div
                className={`text-xs font-semibold flex items-center space-x-1 ${
                  simResult.deltas.delay_risk_diff_pct <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simResult.deltas.delay_risk_diff_pct <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                <span>
                  {simResult.deltas.delay_risk_diff_pct > 0 ? '+' : ''}
                  {simResult.deltas.delay_risk_diff_pct}% ({simResult.deltas.delay_risk_diff_pct <= 0 ? 'Safer' : 'Riskier'})
                </span>
              </div>
            </div>

            {/* Delivery Cost */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Trip Operating Cost</span>
                <IndianRupee className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-sm text-slate-400 font-mono">
                  Base: ₹{simResult.baseline.delivery_cost.toFixed(0)}
                </div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  ₹{simResult.scenario.delivery_cost.toFixed(0)}
                </div>
              </div>
              <div
                className={`text-xs font-semibold flex items-center space-x-1 ${
                  simResult.deltas.cost_difference <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simResult.deltas.cost_difference <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                <span>
                  {simResult.deltas.cost_difference > 0 ? '+' : ''}₹{simResult.deltas.cost_difference.toFixed(0)} (
                  {simResult.deltas.cost_difference <= 0 ? 'Savings' : 'Extra Expense'})
                </span>
              </div>
            </div>

            {/* Carbon Footprint */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Carbon Emissions</span>
                <Leaf className="h-4 w-4 text-green-400" />
              </div>
              <div className="my-2">
                <div className="text-sm text-slate-400 font-mono">
                  Base: {simResult.baseline.carbon_emission_kg} kg
                </div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {simResult.scenario.carbon_emission_kg} kg
                </div>
              </div>
              <div
                className={`text-xs font-semibold flex items-center space-x-1 ${
                  simResult.deltas.carbon_difference_kg <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simResult.deltas.carbon_difference_kg <= 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                <span>
                  {simResult.deltas.carbon_difference_kg > 0 ? '+' : ''}
                  {simResult.deltas.carbon_difference_kg} kg ({simResult.deltas.carbon_difference_kg <= 0 ? 'Reduced' : 'Higher'})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
