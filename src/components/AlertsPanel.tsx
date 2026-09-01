import React, { useState } from 'react';
import { Alert, AlertSeverity, AlertStatus, AlertType } from '../backend/models/index.ts';
import {
  AlertTriangle,
  CheckCircle,
  Play,
  Clock,
  Wrench,
  ShieldAlert,
  Search,
  Check,
} from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  loading: boolean;
  onRunRulesEngine: () => Promise<void>;
  onResolveAlert: (id: string, notes: string) => Promise<void>;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  loading,
  onRunRulesEngine,
  onResolveAlert,
}) => {
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('Inspected telematics & cleared operational status.');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const handleRunEngine = async () => {
    setIsRunningEngine(true);
    try {
      await onRunRulesEngine();
    } finally {
      setIsRunningEngine(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert) return;
    await onResolveAlert(selectedAlert.id, resolveNotes);
    setSelectedAlert(null);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div id="alerts-rules-panel" className="space-y-6">
      {/* Rules Engine Controller Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Operational Fleet Rules Engine & Exception Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous background evaluation for contract overdues, excessive machine idling (&gt;65%), unassigned field usage, and CAN-bus DTC codes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-run-rules-engine"
            onClick={handleRunEngine}
            disabled={isRunningEngine}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-md transition shadow-sm disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunningEngine ? 'animate-spin' : ''}`} />
            <span>{isRunningEngine ? 'Evaluating Rules...' : 'Execute Rules Detection Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Filter Severity Bar */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-slate-400 font-medium">Filter Severity:</span>
        <button
          onClick={() => setFilterSeverity('ALL')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition ${
            filterSeverity === 'ALL'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilterSeverity(AlertSeverity.CRITICAL)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition ${
            filterSeverity === AlertSeverity.CRITICAL
              ? 'bg-red-950 text-red-300 border border-red-800'
              : 'bg-slate-900 text-red-400 hover:bg-red-950/30'
          }`}
        >
          Critical ({alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length})
        </button>
        <button
          onClick={() => setFilterSeverity(AlertSeverity.WARNING)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition ${
            filterSeverity === AlertSeverity.WARNING
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-slate-900 text-amber-400 hover:bg-amber-950/30'
          }`}
        >
          Warning ({alerts.filter((a) => a.severity === AlertSeverity.WARNING).length})
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">All Clear: No Active Anomalies</h3>
          <p className="text-xs text-slate-400 mt-1">
            All rental assets are operating within contractual parameters and healthy CAN telemetry thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.status === AlertStatus.RESOLVED;
            const isCritical = alert.severity === AlertSeverity.CRITICAL;

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`bg-slate-900 border rounded-lg p-4 transition-all ${
                  isResolved
                    ? 'border-slate-800 opacity-60'
                    : isCritical
                    ? 'border-red-900/60 bg-red-950/10'
                    : 'border-amber-900/60 bg-amber-950/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isResolved
                          ? 'bg-slate-800 text-slate-400'
                          : isCritical
                          ? 'bg-red-950 text-red-400 border border-red-800/60'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            isCritical
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {alert.assetModel} ({alert.assetId})
                        </span>
                        {alert.siteId && (
                          <span className="text-xs text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                            Site: {alert.siteId}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 mt-1.5">{alert.message}</p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        </span>
                        {alert.contractNumber && (
                          <span className="font-mono text-slate-300">
                            Contract: {alert.contractNumber}
                          </span>
                        )}
                        {isResolved && (
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Resolved by {alert.resolvedBy}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isResolved && (
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition"
                      >
                        Resolve with Notes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Dialog */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Clear & Resolve Alert ({selectedAlert.id})
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedAlert.message}</p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Field Technician Resolution Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 text-xs bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
