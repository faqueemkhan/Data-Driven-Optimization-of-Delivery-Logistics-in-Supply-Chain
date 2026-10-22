import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
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

// Code-split heavy modules for faster initial load and minimal bundle size
const OverviewModule = lazy(() => import('./components/OverviewModule').then(m => ({ default: m.OverviewModule })));
const DataQualityModule = lazy(() => import('./components/DataQualityModule').then(m => ({ default: m.DataQualityModule })));
const DelayPredictionModule = lazy(() => import('./components/DelayPredictionModule').then(m => ({ default: m.DelayPredictionModule })));
const RouteRegionalMapModule = lazy(() => import('./components/RouteRegionalMapModule').then(m => ({ default: m.RouteRegionalMapModule })));
const PerformanceModule = lazy(() => import('./components/PerformanceModule').then(m => ({ default: m.PerformanceModule })));
const WhatIfAnalysisModule = lazy(() => import('./components/WhatIfAnalysisModule').then(m => ({ default: m.WhatIfAnalysisModule })));
const OptimizationModule = lazy(() => import('./components/OptimizationModule').then(m => ({ default: m.OptimizationModule })));
const DeliveriesExplorerModule = lazy(() => import('./components/DeliveriesExplorerModule').then(m => ({ default: m.DeliveriesExplorerModule })));

function ModuleSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      <p className="text-xs text-slate-400 font-mono tracking-wider">Loading analytics module...</p>
    </div>
  );
}

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
      const results = await Promise.allSettled([
        api.getHealth(),
        api.getOverview(),
        api.getQualityReport(),
        api.getMLMetrics(),
        api.getRoutesGeo(),
        api.getPerformance(),
        api.getOptimization(),
      ]);

      const [h, ov, qr, ml, rg, pf, op] = results;

      if (h.status === 'fulfilled') setHealth(h.value);
      if (ov.status === 'fulfilled') setOverviewData(ov.value);
      if (qr.status === 'fulfilled') setQualityReport(qr.value);
      if (ml.status === 'fulfilled') setMLMetrics(ml.value);
      if (rg.status === 'fulfilled') setRoutesGeo(rg.value);
      if (pf.status === 'fulfilled') setPerformanceData(pf.value);
      if (op.status === 'fulfilled') setOptimizationData(op.value);

      const rejectedCount = results.filter(r => r.status === 'rejected').length;
      if (rejectedCount === results.length) {
        setError('Cannot connect to Logistics Backend API. Please verify the FastAPI server is running (port 8000).');
      } else if (rejectedCount > 0) {
        setError(`Connected to backend with ${rejectedCount} service(s) currently initializing.`);
      }
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
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadInitialData}
              className="px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 font-semibold flex items-center space-x-1 shrink-0 ml-4 transition"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Modules Rendered Based on Active Tab with Suspense */}
        <Suspense fallback={<ModuleSkeleton />}>
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
        </Suspense>
      </main>

      
{/* Footer */}
<footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h2 className="text-base sm:text-lg font-bold text-white">
      Data-Driven Optimization of Delivery Logistics in Supply Chain
    </h2>
  </div>
</footer>

    </div>
  );
}
