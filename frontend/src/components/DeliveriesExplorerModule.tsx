import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DeliveryRecord, FilterOptions } from '../types';
import { api } from '../services/api';

export const DeliveriesExplorerModule: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [partner, setPartner] = useState('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [traffic, setTraffic] = useState('all');
  const [weather, setWeather] = useState('all');
  const [zone, setZone] = useState('all');
  const [delayed, setDelayed] = useState('all');
  const [sortBy, setSortBy] = useState('delivery_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load filter options on mount
  useEffect(() => {
    api.getFilterOptions().then(setFilterOptions).catch(console.error);
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await api.getDeliveries({
        search,
        partner,
        vehicle_type: vehicleType,
        traffic,
        weather,
        zone,
        delayed,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: 20
      });
      setRecords(data.records);
      setTotalMatched(data.total_matched);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, partner, vehicleType, traffic, weather, zone, delayed, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDeliveries();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeliveries();
  };

  const handleExport = () => {
    const url = api.getExportUrl({
      search,
      partner,
      vehicle_type: vehicleType,
      traffic,
      weather,
      zone,
      delayed
    });
    window.open(url, '_blank');
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5 w-max">
            <Database className="h-3.5 w-3.5" />
            <span>Master Consignment Records</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Logistics Deliveries Explorer & CSV Export
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Search, multi-attribute filter, sort, and export all 25,000 processed delivery operations with complete feature engineering.
          </p>
        </div>

        {/* CSV Export Action Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-onaccent text-xs font-bold transition shadow-lg shadow-emerald-600/20 shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Filtered CSV ({totalMatched.toLocaleString()})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Delivery ID, Source City, Destination, Region, or Partner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-onaccent rounded-xl text-xs font-bold transition shadow-md shadow-brand-600/30"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Partner */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Partner</label>
            <select
              value={partner}
              onChange={(e) => { setPartner(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 capitalize"
            >
              <option value="all">All Partners</option>
              {filterOptions?.delivery_partners.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Vehicle</label>
            <select
              value={vehicleType}
              onChange={(e) => { setVehicleType(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 capitalize"
            >
              <option value="all">All Vehicles</option>
              {filterOptions?.vehicle_types.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Traffic */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Traffic</label>
            <select
              value={traffic}
              onChange={(e) => { setTraffic(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Traffic</option>
              {filterOptions?.traffic_levels.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Weather</label>
            <select
              value={weather}
              onChange={(e) => { setWeather(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 capitalize"
            >
              <option value="all">All Weather</option>
              {filterOptions?.weather_conditions.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Operational Zone */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Zone</label>
            <select
              value={zone}
              onChange={(e) => { setZone(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Zones</option>
              {filterOptions?.operational_zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Delay Status */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Arrival Status</label>
            <select
              value={delayed}
              onChange={(e) => { setDelayed(e.target.value); setPage(1); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="all">All Deliveries</option>
              <option value="0">On-Time Only</option>
              <option value="1">Delayed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white font-mono">{records.length}</span> of{' '}
            <span className="font-bold text-white font-mono">{totalMatched.toLocaleString()}</span> matched shipments
          </div>
          <div className="flex items-center space-x-2">
            <span>Sorted by:</span>
            <span className="font-mono text-brand-400 font-bold uppercase">{sortBy} ({sortOrder})</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => toggleSort('delivery_id')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Partner</th>
                <th className="py-3 px-3">Modality</th>
                <th className="py-3 px-3">Route Corridor</th>
                <th
                  onClick={() => toggleSort('distance_km')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Distance</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('delivery_time_hours')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Duration</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Status</th>
                <th
                  onClick={() => toggleSort('delivery_cost')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Cost</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                      <span>Retrieving consignment records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No shipments match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.delivery_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-200">#{r.delivery_id}</td>
                    <td className="py-3 px-3 capitalize font-semibold text-white">{r.delivery_partner}</td>
                    <td className="py-3 px-3 capitalize">
                      <span className={`inline-flex items-center space-x-1 ${r.is_ev ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {r.is_ev ? <Zap className="h-3 w-3" /> : null}
                        <span>{r.vehicle_type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {r.source_city} → {r.destination_city}
                    </td>
                    <td className="py-3 px-3 font-mono">{r.distance_km} km</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="text-white font-bold">{r.delivery_time_hours}h</span>
                      <span className="text-slate-500 text-[10px] ml-1">/ {r.expected_time_hours}h</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.delayed === 1
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {r.delayed === 1 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span>{r.delayed === 1 ? 'Delayed' : 'On-Time'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">₹{r.delivery_cost?.toFixed(0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="font-bold text-white font-mono">{page}</span> of{' '}
            <span className="font-bold text-white font-mono">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
