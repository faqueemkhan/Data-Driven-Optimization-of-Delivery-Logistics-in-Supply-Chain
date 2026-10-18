import React from 'react';
import {
  Package,
  Clock,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  Leaf,
  CheckCircle2,
  Truck
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { OverviewData } from '../types';

interface OverviewModuleProps {
  data: OverviewData | null;
  loading: boolean;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const OverviewModule: React.FC<OverviewModuleProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { kpis, monthly_trends, partner_breakdown, vehicle_breakdown } = data;

  const cards = [
    {
      title: 'Total Deliveries',
      value: kpis.total_deliveries.toLocaleString(),
      sub: 'Analyzed Consignments',
      icon: Package,
      color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400'
    },
    {
      title: 'On-Time Delivery Rate',
      value: `${kpis.on_time_rate_pct}%`,
      sub: `${kpis.on_time_deliveries.toLocaleString()} On-Time`,
      icon: CheckCircle2,
      color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400'
    },
    {
      title: 'Delay Rate',
      value: `${kpis.delay_rate_pct}%`,
      sub: `${kpis.delayed_deliveries.toLocaleString()} Delayed Trips`,
      icon: AlertTriangle,
      color: 'from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400'
    },
    {
      title: 'Avg Delivery Time',
      value: `${kpis.avg_delivery_time_hours} hrs`,
      sub: `Benchmark: ${kpis.avg_expected_time_hours} hrs`,
      icon: Clock,
      color: 'from-indigo-600/20 to-indigo-500/10 border-indigo-500/30 text-indigo-400'
    },
    {
      title: 'Total Delivery Cost',
      value: `₹${(kpis.total_delivery_cost / 1e6).toFixed(2)}M`,
      sub: `Avg ₹${kpis.avg_delivery_cost.toFixed(0)} / shipment`,
      icon: IndianRupee,
      color: 'from-violet-600/20 to-violet-500/10 border-violet-500/30 text-violet-400'
    },
    {
      title: 'Total Net Profit',
      value: `₹${(kpis.total_net_profit / 1e6).toFixed(2)}M`,
      sub: `Avg ₹${kpis.avg_net_profit.toFixed(1)} / shipment`,
      icon: TrendingUp,
      color: 'from-teal-600/20 to-teal-500/10 border-teal-500/30 text-teal-400'
    },
    {
      title: 'Carbon Footprint',
      value: `${kpis.total_carbon_emission_tonnes.toLocaleString()} T`,
      sub: `Avg ${kpis.avg_carbon_emission_kg.toFixed(1)} kg CO2/trip`,
      icon: Leaf,
      color: 'from-green-600/20 to-green-500/10 border-green-500/30 text-green-400'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
            Supply Chain Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Logistics Operational Performance Overview
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            A unified analytics platform for delivery performance monitoring, delay forecasting, and logistics optimization.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
           <div
  key={idx}
  className={`bg-gradient-to-br ${card.color} bg-slate-900/60 border rounded-xl p-4 shadow-md backdrop-blur-sm flex flex-col items-center justify-center text-center gap-2 transition-transform hover:-translate-y-0.5`}
>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-white tracking-tight">{card.value}</div>
                <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Monthly Delivery Volume & Delay Trajectory</h2>
              <p className="text-xs text-slate-400">Total shipments dispatched vs Delay Rate (%) per calendar month</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="h-3 w-3 rounded-sm bg-brand-500 inline-block"></span>
                <span className="text-slate-300">Volume</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-3 w-3 rounded-sm bg-rose-500 inline-block"></span>
                <span className="text-slate-300">Delay Rate %</span>
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="deliveries" fill="#0284c7" radius={[4, 4, 0, 0]} name="Shipments" />
                <Line yAxisId="right" type="monotone" dataKey="delay_rate" stroke="#f43f5e" strokeWidth={2.5} name="Delay Rate (%)" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Fleet Mix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Truck className="h-4 w-4 text-brand-400" />
              <span>Fleet Modality Share</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Vehicle distribution across all deliveries</p>
          </div>
          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicle_breakdown}
                  dataKey="deliveries"
                  nameKey="vehicle_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {vehicle_breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {vehicle_breakdown.map((v, i) => (
              <div key={v.vehicle_type} className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-slate-300 capitalize truncate">{v.vehicle_type}</span>
                <span className="text-slate-500 font-mono text-[10px]">{v.deliveries.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Comparison Row */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Logistics Partner Reliability & Cost Efficiency</h2>
            <p className="text-xs text-slate-400">Total volume, delay rate, average cost, and profit margin per 3PL vendor</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Partner</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Delay Rate</th>
                <th className="py-2.5 px-3">Avg Cost</th>
                <th className="py-2.5 px-3">Avg Profit</th>
                <th className="py-2.5 px-3">Customer Rating</th>
                <th className="py-2.5 px-3 rounded-r-lg">Carbon (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {partner_breakdown.map((p) => (
                <tr key={p.partner} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white capitalize">{p.partner}</td>
                  <td className="py-3 px-3 font-mono">{p.deliveries.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        p.delay_rate > 28
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : p.delay_rate > 24
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {p.delay_rate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">₹{p.avg_cost.toFixed(0)}</td>
                  <td className="py-3 px-3 font-mono">₹{p.avg_profit.toFixed(1)}</td>
                  <td className="py-3 px-3 text-amber-400 font-semibold">{p.avg_rating.toFixed(2)} ★</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{p.avg_carbon.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
