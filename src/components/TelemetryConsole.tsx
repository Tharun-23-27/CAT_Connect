import React, { useState } from 'react';
import { TelemetrySummary, TelemetryLog } from '../backend/models/index.ts';
import {
  Flame,
  AlertCircle,
  Activity,
  Cpu,
  Clock,
  DollarSign,
  PlusCircle,
  Zap,
  TrendingDown,
} from 'lucide-react';

interface TelemetryConsoleProps {
  summary: TelemetrySummary | null;
  loading: boolean;
  onIngestTelemetry: (data: any) => Promise<void>;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({
  summary,
  loading,
  onIngestTelemetry,
}) => {
  const [showIngestForm, setShowIngestForm] = useState(false);
  const [ingestAssetId, setIngestAssetId] = useState('EQX1001');
  const [engineHours, setEngineHours] = useState(2.0);
  const [idleHours, setIdleHours] = useState(9.0);
  const [fuelConsumed, setFuelConsumed] = useState(180);
  const [faultCode, setFaultCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onIngestTelemetry({
        assetId: ingestAssetId,
        engineHoursDay: Number(engineHours),
        idleHoursDay: Number(idleHours),
        fuelConsumedLiters: Number(fuelConsumed),
        diagnosticCodes: faultCode ? [faultCode] : [],
      });
      setShowIngestForm(false);
      setFaultCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-900 rounded-lg" />
        <div className="h-64 bg-slate-900 rounded-lg" />
      </div>
    );
  }

  return (
    <div id="telemetry-analytics-console" className="space-y-6">
      {/* Top Banner: Benchmark Problem Statement Telemetry Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                CAN-Bus ECM Telematics & Fleet Idling Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live Engine Control Module runtime telemetry, fuel burn rates, and idling anomaly detection across active sites.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-open-ingest-log"
              onClick={() => setShowIngestForm(!showIngestForm)}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3.5 py-2 rounded-md transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ingest Daily Telematics Log</span>
            </button>
          </div>
        </div>

        {/* Primary Telematics KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Total Rented Engine Hours */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Fleet Machine Hours</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {summary.totalRentedHours.toFixed(1)} hrs
            </div>
            <div className="mt-1 text-xs text-slate-400 flex justify-between">
              <span>Active: {summary.totalEngineHours.toFixed(1)}h</span>
              <span>Idle: {summary.totalIdleHours.toFixed(1)}h</span>
            </div>
          </div>

          {/* Idle Ratio Anomaly */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overall Idling Percentage</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
              {summary.overallIdlePercentage}%
            </div>
            <div className="mt-1 text-xs text-amber-300/80">
              Benchmark Target: &lt; 25% idle ratio
            </div>
          </div>

          {/* Total Fuel Consumed */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Diesel Burned</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {summary.totalFuelConsumedLiters.toLocaleString()} L
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Avg. 4.2 L/hr fleet consumption
            </div>
          </div>

          {/* Estimated Idling Financial Loss */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Idling Fuel & Wear Waste</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-red-400 font-mono">
              ${summary.estimatedIdlingFuelWasteUsd.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-red-300/80">
              Unrecovered overhead on client sites
            </div>
          </div>
        </div>
      </div>

      {/* Ingest Telemetry Modal / Collapse */}
      {showIngestForm && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-lg p-5">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>Simulate CAN-Bus Edge Telematics Transmission</span>
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Asset ID</label>
              <select
                value={ingestAssetId}
                onChange={(e) => setIngestAssetId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              >
                <option value="EQX1001">EQX1001 (Cat 320)</option>
                <option value="EQX1002">EQX1002 (RT-60 Crane)</option>
                <option value="EQX1003">EQX1003 (Cat 950M)</option>
                <option value="EQX1004">EQX1004 (Cat 349)</option>
                <option value="EQX1005">EQX1005 (Cat D8T)</option>
                <option value="EQX1006">EQX1006 (Cat 16M3)</option>
                <option value="EQX1007">EQX1007 (Cat 323)</option>
                <option value="CAT-DZ-D6-02">CAT-DZ-D6-02 (Cat D6 XE)</option>
                <option value="CAT-SS-299-05">CAT-SS-299-05 (Cat 299D3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Active Engine (hrs)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={engineHours}
                onChange={(e) => setEngineHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Idle Hours</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={idleHours}
                onChange={(e) => setIdleHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Fuel Burn (Liters)</label>
              <input
                type="number"
                min="0"
                value={fuelConsumed}
                onChange={(e) => setFuelConsumed(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">DTC Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SPN 3509 FMI 4"
                value={faultCode}
                onChange={(e) => setFaultCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div className="md:col-span-5 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIngestForm(false)}
                className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
              >
                {isSubmitting ? 'Transmitting...' : 'Send CAN Ingestion Frame'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Site Misallocation & Downtime Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-bold text-white tracking-tight mb-4 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <span>Job Site Machine Allocation & Idling Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Site ID & Name</th>
                <th className="px-4 py-3">Active Engine Hours</th>
                <th className="px-4 py-3">Idle Hours</th>
                <th className="px-4 py-3">Fuel Consumed</th>
                <th className="px-4 py-3">Idle Ratio</th>
                <th className="px-4 py-3 text-right">Est. Misallocation Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {summary.siteBreakdown.map((site) => {
                const total = site.engineHours + site.idleHours;
                const ratio = total > 0 ? Math.round((site.idleHours / total) * 100) : 0;

                return (
                  <tr key={site.siteId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                          {site.siteId}
                        </span>
                        <span>{site.siteName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200">
                      {site.engineHours.toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400">
                      {site.idleHours.toFixed(1)} hrs
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {site.fuelConsumedLiters} L
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            ratio > 50 ? 'text-red-400' : 'text-slate-300'
                          }`}
                        >
                          {ratio}%
                        </span>
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              ratio > 50 ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-400">
                      ${site.misallocationLossUsd.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
