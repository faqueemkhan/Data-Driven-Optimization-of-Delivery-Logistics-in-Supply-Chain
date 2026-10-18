import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewModule } from './components/OverviewModule';
import { DataQualityModule } from './components/DataQualityModule';
import { DelayPredictionModule } from './components/DelayPredictionModule';
import { RouteRegionalMapModule } from './components/RouteRegionalMapModule';
import { PerformanceModule } from './components/PerformanceModule';
import { WhatIfAnalysisModule } from './components/WhatIfAnalysisModule';
import { OptimizationModule } from './components/OptimizationModule';
import { DeliveriesExplorerModule } from './components/DeliveriesExplorerModule';

import {
  HealthStatus,
  OverviewData,
  QualityReport,
  MLMetrics,
  RoutesGeoData,
  PerformanceData,
  OptimizationData
} from './types';
import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // API Data States
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [mlMetrics, setMLMetrics] = useState<MLMetrics | null>(null);
  const [routesGeo, setRoutesGeo] = useState<RoutesGeoData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, ov, qr, ml, rg, pf, op] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getOverview().catch(() => null),
        api.getQualityReport().catch(() => null),
        api.getMLMetrics().catch(() => null),
        api.getRoutesGeo().catch(() => null),
        api.getPerformance().catch(() => null),
        api.getOptimization().catch(() => null),
      ]);

      setHealth(h);
      setOverviewData(ov);
      setQualityReport(qr);
      setMLMetrics(ml);
      setRoutesGeo(rg);
      setPerformanceData(pf);
      setOptimizationData(op);
    } catch (err: any) {
      setError(err.message || 'Error connecting to logistics analytics API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadInitialData}
              className="px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Modules Rendered Based on Active Tab */}
        {activeTab === 'overview' && (
          <OverviewModule data={overviewData} loading={loading} />
        )}

        {activeTab === 'quality' && (
          <DataQualityModule report={qualityReport} loading={loading} />
        )}

        {activeTab === 'prediction' && (
          <DelayPredictionModule metrics={mlMetrics} loading={loading} />
        )}

        {activeTab === 'routes-geo' && (
          <RouteRegionalMapModule data={routesGeo} loading={loading} />
        )}

        {activeTab === 'performance' && (
          <PerformanceModule data={performanceData} loading={loading} />
        )}

        {activeTab === 'whatif' && (
          <WhatIfAnalysisModule />
        )}

        {activeTab === 'optimization' && (
          <OptimizationModule data={optimizationData} loading={loading} />
        )}

        {activeTab === 'deliveries' && (
          <DeliveriesExplorerModule />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-400">LogiOptima AI</span> — Data-Driven Optimization of Delivery Logistics in Supply Chain
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>FastAPI + Scikit-Learn</span>
            <span>•</span>
            <span>React + TypeScript + Tailwind</span>
            <span>•</span>
            <span>25,000 Deliveries Dataset</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
