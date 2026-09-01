import React from 'react';
import {
  Activity,
  AlertTriangle,
  Server,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'fleet' | 'telemetry' | 'alerts' | 'map' | 'ai';
  setActiveTab: (tab: 'fleet' | 'telemetry' | 'alerts' | 'map' | 'ai') => void;
  activeAlertsCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenDocs: () => void;
  serverStatus: 'ONLINE' | 'CONNECTING' | 'ERROR';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  onRefresh,
  isRefreshing,
  onOpenDocs,
  serverStatus,
}) => {
  return (
    <header
      id="app-header"
      className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter shadow-md">
              CAT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  CONNECT
                </span>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded font-mono font-medium">
                  TELEMATICS v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Rental Fleet Telematics & Predictive CAN-Bus Gateway
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            <button
              id="nav-tab-fleet"
              onClick={() => setActiveTab('fleet')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'fleet'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Fleet Directory
            </button>

            <button
              id="nav-tab-telemetry"
              onClick={() => setActiveTab('telemetry')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'telemetry'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              CAN-Bus Diagnostics
            </button>

            <button
              id="nav-tab-alerts"
              onClick={() => setActiveTab('alerts')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Alerts & Rules</span>
              {activeAlertsCount > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'alerts'
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-red-500 text-white animate-pulse'
                  }`}
                >
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Job Site Radar
            </button>

            <button
              id="nav-tab-ai"
              onClick={() => setActiveTab('ai')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                activeTab === 'ai'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-amber-400 font-bold">✦</span>
              <span>Gemini Copilot</span>
            </button>
          </nav>

          {/* Right Action Bar: Status, Docs, Refresh */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus === 'ONLINE'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-red-400'
                }`}
              />
              <span className="text-xs font-mono text-slate-300">
                API v1: {serverStatus}
              </span>
            </div>

            <button
              id="btn-api-docs"
              onClick={onOpenDocs}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded border border-slate-700 transition"
              title="Inspect Express REST API specification & schemas"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>API Catalog</span>
            </button>

            <button
              id="btn-refresh-data"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition disabled:opacity-50"
              title="Refresh Telematics Stream"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
