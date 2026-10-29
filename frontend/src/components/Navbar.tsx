import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  MapPin,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  Database,
  Activity
} from 'lucide-react';
import { HealthStatus } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, health }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'prediction', label: 'ML Delay Prediction', icon: Cpu },
    { id: 'routes-geo', label: 'Route & Regional GIS', icon: MapPin },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'whatif', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'optimization', label: 'Optimization', icon: Sparkles },
    { id: 'deliveries', label: 'Data Explorer', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Activity className="h-6 w-6 text-onaccent" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white sm:text-lg">
                  Route<span className="text-brand-500">IQ</span>
                  <span className="ml-2 font-semibold text-slate-400 text-sm sm:text-base">Delivery Intelligence</span>
                </span>
              { /* <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-wider font-mono">
                  v1.0
                </span>
                */}
              </div>
              <p className="text-xs text-slate-400 hidden md:block line-clamp-1">
                Data-Driven Optimization of Delivery Logistics in Supply Chain
              </p>
            </div>
          </div>

         {/* Login and Sign In Boxes */}  
<div className="flex items-center gap-2">
  <ThemeToggle />
  <button className="px-3 py-1 rounded-md border border-white/30 text-white transition-all duration-300 hover:bg-white hover:text-slate-950 hover:border-white hover:shadow-lg hover:shadow-white/10">
    Login
  </button>

  <button className="px-3 py-1 rounded-md border border-white/30 text-white transition-all duration-300 hover:bg-white hover:text-slate-950 hover:border-white hover:shadow-lg hover:shadow-white/10">
    Sign In
  </button>
</div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-onaccent shadow-md shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-onaccent' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
