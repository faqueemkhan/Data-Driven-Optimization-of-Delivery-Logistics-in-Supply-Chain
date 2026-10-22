import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation,
  Layers,
  Info,
  Building,
  TrendingDown,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { RoutesGeoData } from '../types';

interface RouteRegionalMapModuleProps {
  data: RoutesGeoData | null;
  loading: boolean;
}

export const RouteRegionalMapModule: React.FC<RouteRegionalMapModuleProps> = ({ data, loading }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'warehouses' | 'corridors' | 'regions'>('all');

  useEffect(() => {
    if (!data || !mapContainerRef.current) return;

    // Destroy prior map instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map centered over India
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.5],
      zoom: 5,
      zoomControl: true,
      attributionControl: true
    });
    mapInstanceRef.current = map;

    // OpenStreetMap tiles do not require an API key. CartoDB's public tile
    // endpoint now rejects anonymous requests, leaving the map background blank.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      // OpenStreetMap exposes the a, b, and c tile hosts (not Carto's d host).
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    // 1. Plot Warehouses
    if (activeLayer === 'all' || activeLayer === 'warehouses') {
      data.warehouses.forEach((wh) => {
        const marker = L.circleMarker([wh.latitude, wh.longitude], {
          radius: 9,
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 800; color: #f59e0b; margin-bottom: 4px;">🏭 WAREHOUSE: ${wh.name}</div>
            <div><strong>Shipments:</strong> ${wh.deliveries.toLocaleString()}</div>
            <div><strong>Delay Rate:</strong> ${wh.delay_rate}%</div>
            <div><strong>Avg Delivery Cost:</strong> ₹${wh.avg_cost?.toFixed(0) || '0'}</div>
            <div><strong>Avg Net Profit:</strong> ₹${wh.avg_profit?.toFixed(1) || '0'}</div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 2. Plot Top Corridors (Polylines)
    if (activeLayer === 'all' || activeLayer === 'corridors') {
      data.top_corridors.slice(0, 15).forEach((corr) => {
        const strokeColor = corr.delay_rate > 28 ? '#f43f5e' : corr.delay_rate > 24 ? '#f59e0b' : '#10b981';
        const line = L.polyline([corr.source_coords, corr.destination_coords], {
          color: strokeColor,
          weight: Math.min(5, Math.max(2, corr.volume / 80)),
          opacity: 0.65,
          dashArray: corr.delay_rate > 28 ? '6, 6' : undefined
        });

        line.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 800; color: #0ea5e9; margin-bottom: 4px;">🛣️ ${corr.route}</div>
            <div><strong>Traffic Volume:</strong> ${corr.volume} deliveries</div>
            <div><strong>Delay Rate:</strong> <span style="color: ${strokeColor}; font-weight: bold;">${corr.delay_rate}%</span></div>
            <div><strong>Avg Distance:</strong> ${corr.avg_distance_km} km</div>
            <div><strong>Avg Transit Time:</strong> ${corr.avg_delivery_time_hours} hrs</div>
            <div><strong>Avg Cost:</strong> ₹${corr.avg_cost.toFixed(0)}</div>
          </div>
        `);
        layerGroup.addLayer(line);
      });
    }

    // 3. Plot Regional Hubs
    if (activeLayer === 'all' || activeLayer === 'regions') {
      data.regions.forEach((reg) => {
        const marker = L.circleMarker([reg.latitude, reg.longitude], {
          radius: 6,
          fillColor: '#0ea5e9',
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: 800; color: #0284c7; margin-bottom: 4px;">📍 REGION: ${reg.region} (${reg.zone})</div>
            <div><strong>Deliveries:</strong> ${reg.deliveries.toLocaleString()}</div>
            <div><strong>Delay Rate:</strong> ${reg.delay_rate}%</div>
            <div><strong>Avg Transit Time:</strong> ${reg.avg_delivery_time} hrs</div>
            <div><strong>Road Quality Index:</strong> ${reg.avg_road_quality}/100</div>
            <div><strong>Avg Net Profit:</strong> ₹${reg.avg_profit.toFixed(1)}</div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, activeLayer]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const { warehouses, regions, route_type_comparison, stops_impact } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 flex items-center space-x-1.5 w-max">
            <MapPin className="h-3.5 w-3.5" />
            <span>Geographic Information System (GIS)</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Route Corridors & Regional Geographic Analysis
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Spatial distribution of shipments, hub connectivity, transit corridors, and road surface index impact using verified GPS coordinates.
          </p>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Compass className="h-4 w-4 text-brand-400" />
              <span>Interactive Supply Chain Logistics Network Map</span>
            </h2>
            <p className="text-xs text-slate-400">Click on any warehouse, corridor polyline, or regional hub to inspect telemetry</p>
          </div>

          {/* Layer Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            {(['all', 'warehouses', 'corridors', 'regions'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                  activeLayer === layer
                    ? 'bg-brand-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet DOM container */}
        <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-700/60 relative">
          <div ref={mapContainerRef} className="h-full w-full z-10" />

          {/* Map legend overlay */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-[11px] shadow-xl text-slate-300 space-y-1.5 pointer-events-auto">
            <div className="font-bold text-white text-xs border-b border-slate-800 pb-1">Legend</div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 border border-white inline-block"></span>
              <span>Central Warehouses (5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-sky-500 border border-white inline-block"></span>
              <span>Regional Hubs (20)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-1 w-4 bg-emerald-500 inline-block"></span>
              <span>Low Delay Corridor (&lt;24%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-1 w-4 bg-rose-500 inline-block"></span>
              <span>High Delay Corridor (&gt;28%)</span>
            </div>
          </div>
        </div>
      </div>

      
{/* Route Type & Stops Analysis */}
<div className="w-full flex justify-center">
  <div className="w-full max-w-[900px] bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-base font-bold text-white">
          Route Type Dynamics: Highway vs Urban vs Rural
        </h2>
        <p className="text-xs text-slate-400">
          Transit velocity, road quality, and delay rate correlation
        </p>
      </div>
      <Navigation className="h-4 w-4 text-brand-400" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {route_type_comparison.map((rt) => (
        <div
          key={rt.route_type}
          className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-bold text-brand-400 tracking-wide uppercase">
              {rt.route_type}
            </span>
            <div className="text-xl font-black text-white mt-1 font-mono">
              {rt.delay_rate}%
            </div>
            <div className="text-[10px] text-slate-400">Delay Rate</div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700/40 space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Avg Speed:</span>
              <span className="font-mono text-white">{rt.avg_speed_kmh} km/h</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Road Quality:</span>
              <span className="font-mono text-white">{rt.avg_road_quality}/100</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Avg Stops:</span>
              <span className="font-mono text-white">{rt.avg_stops}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">GPS Dev:</span>
              <span className="font-mono text-white">{rt.avg_deviation_km} km</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

    </div>
  );
};
