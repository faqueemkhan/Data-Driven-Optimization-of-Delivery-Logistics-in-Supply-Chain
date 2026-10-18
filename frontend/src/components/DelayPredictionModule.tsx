import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
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
import { MLMetrics, PredictionResult } from '../types';
import { api } from '../services/api';

interface DelayPredictionModuleProps {
  metrics: MLMetrics | null;
  loading: boolean;
}

export const DelayPredictionModule: React.FC<DelayPredictionModuleProps> = ({ metrics, loading }) => {
  const [formData, setFormData] = useState({
    delivery_partner: 'delhivery',
    package_type: 'electronics',
    vehicle_type: 'bike',
    delivery_mode: 'same day',
    region: 'Mumbai',
    weather_condition: 'rainy',
    traffic_level: 'High',
    delivery_priority: 'Critical',
    warehouse_location: 'Mumbai',
    customer_type: 'B2C',
    delivery_shift: 'Evening',
    operational_zone: 'West Zone',
    source_city: 'Pune',
    destination_city: 'Nagpur',
    route_type: 'Highway',
    driver_age_group: '26-35',
    accident_history_flag: 'No',
    rush_hour_delivery: 'Yes',
    weekend_delivery: 'No',
    holiday_season: 'No',
    distance_km: 180,
    package_weight_kg: 24,
    expected_time_hours: 22,
    driver_experience_years: 5,
    order_value: 6500,
    driver_rating: 4.2,
    road_quality_index: 70,
    number_of_stops: 2,
    warehouse_to_customer_distance: 195,
    vehicle_capacity_utilization: 75,
    weather_severity_score: 3,
    driver_daily_deliveries: 28,
    maintenance_score: 80
  });

  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predError, setPredError] = useState<string | null>(null);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { metrics: scores, confusion_matrix, feature_importances, leakage_prevention, training_samples, testing_samples } = metrics;

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredError(null);
    try {
      const res = await api.predictDelay(formData);
      setPredictionResult(res);
    } catch (err: any) {
      setPredError(err.message || 'Failed to generate prediction');
    } finally {
      setPredicting(false);
    }
  };

  const top10Features = feature_importances?.slice(0, 8) || [];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5">
              <Cpu className="h-3.5 w-3.5" />
              <span>Production Scikit-Learn Model</span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero Data Leakage Audited</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Delivery Delay Risk Prediction Engine
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Trained with an 80/20 stratified split ({training_samples.toLocaleString()} train / {testing_samples.toLocaleString()} test). Uses strictly dispatch-time features to ensure zero target contamination.
          </p>
        </div>
      </div>

      {/* Model Evaluation Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Accuracy</span>
          <div className="text-2xl font-black text-white mt-1">{(scores.accuracy * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Overall Classification</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Precision</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{(scores.precision * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">True Delay Reliability</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">Recall</span>
          <div className="text-2xl font-black text-brand-400 mt-1">{(scores.recall * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Delay Detection Power</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-400">F1-Score</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{(scores.f1_score * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Harmonic Mean</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-400">ROC-AUC</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{(scores.roc_auc * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Separability Index</div>
        </div>
      </div>

      {/* Model Internals & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Importance Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Primary Delay Predictor Variables</h2>
              <p className="text-xs text-slate-400">Normalized feature importance weights from Random Forest model</p>
            </div>
            <span className="text-xs text-brand-400 font-mono">RandomForest (150 trees)</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10Features}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="importance_pct" fill="#0284c7" radius={[0, 4, 4, 0]}>
                  {top10Features.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix & Leakage Audit */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Holdout Confusion Matrix</h2>
            <p className="text-xs text-slate-400 mb-3">Evaluated on 5,000 unseen test deliveries</p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3">
                <div className="text-lg font-black text-emerald-400">{confusion_matrix.true_negative.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">True Negative (On-Time)</div>
              </div>
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3">
                <div className="text-lg font-black text-rose-400">{confusion_matrix.false_positive.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">False Positive (False Alarm)</div>
              </div>
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3">
                <div className="text-lg font-black text-amber-400">{confusion_matrix.false_negative.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">False Negative (Missed Delay)</div>
              </div>
              <div className="bg-brand-950/40 border border-brand-500/30 rounded-lg p-3">
                <div className="text-lg font-black text-brand-400">{confusion_matrix.true_positive.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 uppercase mt-0.5">True Positive (Detected Delay)</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Data Leakage Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Excludes all post-trip feedback: actual delivery time, late penalty fees, recorded GPS deviation, and customer satisfaction scores.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Live Prediction Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Live Consignment Delay Risk Evaluator</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Input planned dispatch parameters to evaluate real-time delay probability, determine risk level, and inspect actionable dispatch adjustments.
        </p>

        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Delivery Partner */}
            <div>
              <label className="block text-slate-400 mb-1">3PL Delivery Partner</label>
              <select
                value={formData.delivery_partner}
                onChange={(e) => setFormData({ ...formData, delivery_partner: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {metrics.categorical_options.delivery_partner?.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-slate-400 mb-1">Vehicle Modality</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {metrics.categorical_options.vehicle_type?.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Traffic Level */}
            <div>
              <label className="block text-slate-400 mb-1">Predicted Traffic Level</label>
              <select
                value={formData.traffic_level}
                onChange={(e) => setFormData({ ...formData, traffic_level: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            {/* Weather Condition */}
            <div>
              <label className="block text-slate-400 mb-1">Weather Condition</label>
              <select
                value={formData.weather_condition}
                onChange={(e) => setFormData({ ...formData, weather_condition: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {metrics.categorical_options.weather_condition?.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-slate-400 mb-1">Route Distance (km): {formData.distance_km}</label>
              <input
                type="range"
                min="10"
                max="300"
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Expected Hours */}
            <div>
              <label className="block text-slate-400 mb-1">SLA Target Time (hours): {formData.expected_time_hours}</label>
              <input
                type="range"
                min="6"
                max="60"
                value={formData.expected_time_hours}
                onChange={(e) => setFormData({ ...formData, expected_time_hours: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Stops */}
            <div>
              <label className="block text-slate-400 mb-1">Number of Stops: {formData.number_of_stops}</label>
              <input
                type="range"
                min="0"
                max="6"
                value={formData.number_of_stops}
                onChange={(e) => setFormData({ ...formData, number_of_stops: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            {/* Rush Hour */}
            <div>
              <label className="block text-slate-400 mb-1">Rush Hour Dispatch</label>
              <select
                value={formData.rush_hour_delivery}
                onChange={(e) => setFormData({ ...formData, rush_hour_delivery: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="No">No (Off-Peak)</option>
                <option value="Yes">Yes (Peak Windows)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Inference runs via Scikit-Learn Pipeline on FastAPI backend.
            </span>
            <button
              type="submit"
              disabled={predicting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-lg shadow-brand-600/30 disabled:opacity-50"
            >
              {predicting ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                  <span>Evaluating Risk...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Run Delay Prediction</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Results Banner */}
        {predictionResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-800/90 border border-slate-700 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                    predictionResult.is_delayed
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {predictionResult.risk_level}
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">
                  Predicted Delay Probability: {predictionResult.delay_probability_pct}%
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Target Binary Outcome</span>
                <span className={`text-sm font-black font-mono ${predictionResult.is_delayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {predictionResult.is_delayed ? 'DELAY EXPECTED [Class 1]' : 'ON-TIME ARRIVAL [Class 0]'}
                </span>
              </div>
            </div>

            {/* Contributing factors & mitigations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-300 flex items-center space-x-1.5 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Identified Delay Drivers:</span>
                </h4>
                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                  {predictionResult.contributing_factors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 flex items-center space-x-1.5 mb-2">
                  <Award className="h-3.5 w-3.5 text-brand-400" />
                  <span>Recommended Dispatch Mitigations:</span>
                </h4>
                <ul className="space-y-1 text-emerald-400 list-disc list-inside">
                  {predictionResult.actionable_mitigations.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {predError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {predError}
          </div>
        )}
      </div>
    </div>
  );
};
