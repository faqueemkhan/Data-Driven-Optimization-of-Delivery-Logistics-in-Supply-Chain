import React, { useState } from 'react';
import {
  BarChart3,
  Truck,
  CloudSun,
  Flame,
  Award,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { PerformanceData } from '../types';

interface PerformanceModuleProps {
  data: PerformanceData | null;
  loading: boolean;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const PerformanceModule: React.FC<PerformanceModuleProps> = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState<'partners' | 'vehicles' | 'weather' | 'traffic'>('partners');

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { partner_performance, vehicle_performance, weather_impact, traffic_impact, rush_hour_comparison } = data;

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5 w-max">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Benchmarking & Operational Telemetry</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Logistics Multidimensional Performance Analysis
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Comparative analysis dissecting vendor SLAs, powertrain fuel economy, climate weather severity, and traffic bottlenecks.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'partners'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>3PL Delivery Partners</span>
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'vehicles'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Fleet & Vehicle Types</span>
        </button>
        <button
          onClick={() => setActiveTab('weather')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'weather'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CloudSun className="h-4 w-4" />
          <span>Weather Conditions</span>
        </button>
        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'traffic'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Traffic & Congestion</span>
        </button>
      </div>

      {/* Tab 1: Partners */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white mb-1">Partner SLA Reliability & Delay Rate Comparison</h2>
            <p className="text-xs text-slate-400 mb-4">Delay rate (%) across all 3PL partners with delivery volume weights</p>
            <div className="h-64">
             
<ResponsiveContainer width="100%" height="100%">
  <BarChart
    data={[...partner_performance].sort(
      (a, b) => a.delay_rate_pct - b.delay_rate_pct
    )}
    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
    barCategoryGap="10%"
  >
    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#1e293b"
      vertical={false}
    />

    <XAxis
      dataKey="partner"
      stroke="#64748b"
      tick={{ fontSize: 11, fill: '#94a3b8' }}
      tickLine={false}
      axisLine={false}
    />

    <YAxis
      stroke="#64748b"
      tick={{ fontSize: 11, fill: '#94a3b8' }}
      tickLine={false}
      axisLine={false}
      unit="%"
    />

    <Tooltip
      contentStyle={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        fontSize: '12px'
      }}
      labelStyle={{
        color: '#e2e8f0',
        fontWeight: 700
      }}
      itemStyle={{ color: '#38bdf8' }}
    />

    <Bar
      dataKey="delay_rate_pct"
      name="Delay Rate (%)"
      fill="#38bdf8"
      radius={[4, 4, 0, 0]}
      maxBarSize={18}
    />
  </BarChart>
</ResponsiveContainer>

            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3">Comprehensive Partner Scorecard</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Partner</th>
                  <th className="py-2.5 px-3">Total Shipments</th>
                  <th className="py-2.5 px-3">On-Time %</th>
                  <th className="py-2.5 px-3">Delay %</th>
                  <th className="py-2.5 px-3">Avg Cost</th>
                  <th className="py-2.5 px-3">Avg Fuel</th>
                  <th className="py-2.5 px-3">Avg Late Penalty</th>
                  <th className="py-2.5 px-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {partner_performance.map((p) => (
                  <tr key={p.partner} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white capitalize">{p.partner}</td>
                    <td className="py-2.5 px-3 font-mono">{p.deliveries.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">{p.on_time_rate_pct}%</td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono font-bold">{p.delay_rate_pct}%</td>
                    <td className="py-2.5 px-3 font-mono">₹{p.avg_cost.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono">₹{p.avg_fuel_cost.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">₹{p.avg_penalty.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-amber-400 font-semibold">{p.avg_rating.toFixed(2)} ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicle_performance.map((v) => (
              <div
                key={v.vehicle_type}
                className={`bg-slate-900/80 border ${v.is_ev ? 'border-emerald-500/40' : 'border-slate-800'} rounded-xl p-5 shadow-lg relative overflow-hidden`}
              >
                {v.is_ev && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                    <Zap className="h-3 w-3" />
                    <span>Clean Energy EV</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Truck className={`h-5 w-5 ${v.is_ev ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <h3 className="text-base font-bold text-white capitalize">{v.vehicle_type}</h3>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Volume:</span>
                    <span className="font-mono text-white font-bold">{v.deliveries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delay Rate:</span>
                    <span className="font-mono text-amber-400 font-bold">{v.delay_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Fuel Cost:</span>
                    <span className="font-mono text-white font-bold">₹{v.avg_fuel_cost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carbon Footprint:</span>
                    <span className={`font-mono font-bold ${v.is_ev ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {v.avg_carbon_kg.toFixed(1)} kg CO2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity Utilization:</span>
                    <span className="font-mono text-indigo-400 font-bold">{v.avg_capacity_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fleet Maintenance:</span>
                    <span className="font-mono text-white">{v.avg_maintenance_score}/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Weather */}
      {activeTab === 'weather' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h2 className="text-base font-bold text-white mb-1">Weather Impact on Delivery Duration & Delays</h2>
          <p className="text-xs text-slate-400 mb-4">Adverse weather conditions degrade transit time and increase route deviation</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weather_impact.map((w) => (
              <div key={w.weather} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white capitalize">{w.weather}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                    Severity: {w.avg_severity_score}/5
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deliveries:</span>
                    <span className="font-mono text-white">{w.deliveries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delay Rate:</span>
                    <span className="font-mono text-rose-400 font-bold">{w.delay_rate_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Delivery Time:</span>
                    <span className="font-mono text-white">{w.avg_time_hours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Traffic Delay Minutes:</span>
                    <span className="font-mono text-amber-400">{w.avg_traffic_delay_mins} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Route Deviation:</span>
                    <span className="font-mono text-slate-300">{w.avg_gps_deviation_km} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
{/* Tab 4: Traffic */}
{activeTab === 'traffic' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {traffic_impact.map((t) => (
        <div
          key={t.traffic_level}
          className="flex flex-col min-w-0 h-full bg-slate-900/80 border border-slate-800 rounded-xl p-4"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {t.traffic_level} Traffic
          </span>

          <div className="text-2xl font-black text-white mt-2 font-mono leading-tight">
            {t.delay_rate_pct}%
          </div>

          <div className="text-[11px] text-slate-500 mt-1">
            Delay Rate
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-3 flex-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Delay Added:</span>
              <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
                {t.avg_traffic_delay_mins} mins
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Avg Total Time:</span>
              <span className="font-mono text-white whitespace-nowrap">
                {t.avg_time_hours} hrs
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Fuel Expenditure:</span>
              <span className="font-mono text-white whitespace-nowrap">
                ₹{t.avg_fuel_cost.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    
    </div>
  );
};
