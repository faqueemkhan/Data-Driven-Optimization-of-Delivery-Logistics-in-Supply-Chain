import React from 'react';
import {
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Clock,
  ArrowRight,
  IndianRupee,
  DollarSign
} from 'lucide-react';
import { OptimizationData } from '../types';

interface OptimizationModuleProps {
  data: OptimizationData | null;
  loading: boolean;
}

export const OptimizationModule: React.FC<OptimizationModuleProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { summary, recommendations } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5 w-max">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prescriptive Logistics Analytics</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Supply Chain Optimization Recommendations
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Algorithmic interventions designed to minimize delivery bottlenecks, eliminate late penalties, transition toward net-zero emissions, and elevate operational margins.
          </p>
        </div>
      </div>

      {/* Aggregate Impact Banner */}
      <div className="bg-gradient-to-br from-brand-950/60 via-slate-900 to-emerald-950/40 border border-brand-500/30 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-4">
          Projected Annual Business Impact Upon Execution
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <IndianRupee className="h-4 w-4 text-emerald-400" />
              <span>Projected Annual Cost Savings</span>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
              ₹{(summary.projected_annual_cost_savings / 1e6).toFixed(2)}M
            </div>
            <div className="text-xs text-slate-500 mt-1">Fuel efficiency & penalty mitigation</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Leaf className="h-4 w-4 text-green-400" />
              <span>Carbon Footprint Abatement</span>
            </div>
            <div className="text-3xl font-black text-green-400 font-mono mt-2">
              {summary.projected_carbon_reduction_tonnes.toLocaleString()} Tonnes
            </div>
            <div className="text-xs text-slate-500 mt-1">Direct tailpipe CO2 reduction via EVs</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock className="h-4 w-4 text-brand-400" />
              <span>Delivery Delay Reduction</span>
            </div>
            <div className="text-3xl font-black text-brand-400 font-mono mt-2">
              -{summary.projected_delay_rate_reduction_pct}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Shift window & waypoint consolidation</div>
          </div>
        </div>
      </div>

      {/* Concrete Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-400">{rec.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    rec.priority === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">{rec.title}</h3>
              <div className="text-xs font-semibold text-emerald-400 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                Target Impact: {rec.impact_metric}
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {rec.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider text-[10px]">
                Implementation Action Items
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {rec.implementation_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
