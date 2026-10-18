import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  Search
} from 'lucide-react';
import { QualityReport } from '../types';

interface DataQualityModuleProps {
  report: QualityReport | null;
  loading: boolean;
}

export const DataQualityModule: React.FC<DataQualityModuleProps> = ({ report, loading }) => {
  const [outlierSearch, setOutlierSearch] = useState('');

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { quality_score, metrics, validation_results, outliers, total_records, total_columns, duplicate_records, missing_values } = report;

  const outlierEntries = Object.entries(outliers || {}).filter(([col]) =>
    col.toLowerCase().includes(outlierSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Quality Score Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Automated Pipeline Validation Audit</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Data Quality & Pipeline Integrity Report
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Automated schema enforcement, missing value profiling, duplicate rejection, geographic validation, and statistical IQR outlier screening.
          </p>
        </div>

        {/* Quality Score Badge */}
        <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 px-6 shadow-inner">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {quality_score}%
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Composite Quality Index
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Ingested Records</span>
            <FileSpreadsheet className="h-4 w-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{total_records.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{total_columns} Analyzed Columns</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completeness</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{metrics?.completeness_pct ?? 100}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {Object.keys(missing_values || {}).length === 0 ? '0 Missing / Null Values' : `${Object.keys(missing_values).length} Columns with nulls`}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Uniqueness</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{metrics?.uniqueness_pct ?? 100}%</div>
          <div className="text-xs text-slate-500 mt-1">{duplicate_records} Duplicate Rows Detected</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Rule Conformance</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{metrics?.validity_pct ?? 100}%</div>
          <div className="text-xs text-slate-500 mt-1">{validation_results.length} Core Rules Evaluated</div>
        </div>
      </div>

      {/* Validation Rules Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-white mb-1">Automated Schema & Domain Validation Rules</h2>
        <p className="text-xs text-slate-400 mb-4">Verification of numeric ranges, GPS latitude/longitude boundaries, categorical targets, and key uniqueness.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {validation_results.map((rule, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/60 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-200">{rule.rule}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    rule.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {rule.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">{rule.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Outlier Detection via IQR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Statistical Outlier Analysis (Tukey IQR Method)</span>
              <Info className="h-4 w-4 text-slate-400" />
            </h2>
            <p className="text-xs text-slate-400">
              IQR thresholding: [Q1 - 1.5×IQR, Q3 + 1.5×IQR]. Preserved in dataset to allow realistic extreme variance modeling.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search column..."
              value={outlierSearch}
              onChange={(e) => setOutlierSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[11px] sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Min / Max</th>
                <th className="py-2.5 px-3">Mean ± Std</th>
                <th className="py-2.5 px-3">Q1 / Q3</th>
                <th className="py-2.5 px-3">IQR</th>
                <th className="py-2.5 px-3">Lower / Upper Bound</th>
                <th className="py-2.5 px-3">Outliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {outlierEntries.map(([col, o]) => (
                <tr key={col} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white font-mono">{col}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {o.min} / {o.max}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {o.mean} ± {o.std}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {o.q1} / {o.q3}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{o.iqr}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    [{o.lower_bound}, {o.upper_bound}]
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        o.outlier_count > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {o.outlier_count} ({o.outlier_percentage}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
