import React from 'react';
import { X, FileCode, ExternalLink, CheckCircle } from 'lucide-react';

interface ApiDocsModalProps {
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ onClose }) => {
  const endpoints = [
    { method: 'GET', path: '/api/v1/health', desc: 'System status, CAN-bus gateway uptime' },
    { method: 'GET', path: '/api/v1/docs', desc: 'Catalog of all available endpoints & routes' },
    { method: 'GET', path: '/api/v1/assets/overview', desc: 'Fleet KPIs (utilization %, health, run-rate)' },
    { method: 'GET', path: '/api/v1/assets', desc: 'List all assets (supports status, type, siteId filters)' },
    { method: 'GET', path: '/api/v1/assets/:id', desc: 'Detailed asset profile with live ECM telematics' },
    { method: 'PATCH', path: '/api/v1/assets/:id/status', desc: 'Update machine status & job site assignment' },
    { method: 'GET', path: '/api/v1/assets/telematics/live', desc: 'Live GPS stream & CAN diagnostics' },
    { method: 'GET', path: '/api/v1/rentals/active', desc: 'List all ongoing active rentals' },
    { method: 'POST', path: '/api/v1/rentals/checkout', desc: 'Dispatch machine, assign operator, generate contract' },
    { method: 'POST', path: '/api/v1/rentals/checkin', desc: 'Check-in machine, audit hours & fuel, compute billing' },
    { method: 'POST', path: '/api/v1/rentals/verify-qr', desc: 'Scan QR/RFID code to verify machine dispatch readiness' },
    { method: 'POST', path: '/api/v1/telemetry/log', desc: 'Ingest daily/hourly telemetry log with anomaly detection' },
    { method: 'GET', path: '/api/v1/telemetry/summary', desc: 'Fleet idling %, fuel waste $, site breakdown' },
    { method: 'GET', path: '/api/v1/telemetry/asset/:assetId', desc: 'Historical telemetry time-series for asset' },
    { method: 'GET', path: '/api/v1/alerts', desc: 'List operational exceptions (overdues, high idle, DTC)' },
    { method: 'POST', path: '/api/v1/alerts/run-detection', desc: 'Execute Rules Engine detection cycle' },
    { method: 'PATCH', path: '/api/v1/alerts/:id/resolve', desc: 'Resolve alert with technician notes' },
    { method: 'POST', path: '/api/v1/ai/demand-forecast', desc: 'Gemini AI site demand & pre-positioning model' },
    { method: 'POST', path: '/api/v1/ai/explain-anomaly', desc: 'Gemini AI root cause diagnosis & corrective actions' },
    { method: 'POST', path: '/api/v1/ai/fleet-query', desc: 'Natural language fleet management assistant' },
    { method: 'GET', path: '/api/v1/sites', desc: 'List construction and quarry job sites' },
    { method: 'GET', path: '/api/v1/operators', desc: 'List certified heavy equipment operators' },
  ];

  return (
    <div
      id="modal-api-docs-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-api-docs-content"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Express REST API Specification (Layered Architecture)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Base URL: <span className="text-amber-400">/api/v1/...</span> • Zod Validated • Standard Envelope
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-xs">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center justify-between hover:border-amber-500/40 transition"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                    ep.method === 'GET'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : ep.method === 'POST'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-slate-200 font-semibold">{ep.path}</span>
              </div>
              <span className="text-slate-400">{ep.desc}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center text-xs text-slate-400">
          <span>Clean Architecture: Models ➔ Repositories ➔ Services ➔ Controllers ➔ Routes</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
