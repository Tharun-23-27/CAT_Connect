import React, { useState } from 'react';
import { DemandPrediction, AnomalyAnalysis } from '../backend/models/index.ts';
import {
  Sparkles,
  Send,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Cpu,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';

interface AiCopilotProps {
  onDemandForecast: (timeframeDays: number) => Promise<DemandPrediction[]>;
  onExplainAnomaly: (assetId: string) => Promise<AnomalyAnalysis>;
  onFleetQuery: (query: string) => Promise<any>;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({
  onDemandForecast,
  onExplainAnomaly,
  onFleetQuery,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'demand' | 'diagnostics'>('chat');

  // Query state
  const [queryInput, setQueryInput] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; relatedAssetIds?: string[] }[]
  >([
    {
      sender: 'assistant',
      text: 'Hello! I am your Caterpillar Connect AI Fleet Analyst. Ask me about active rentals, overdue penalties, high idle anomalies, or machine demand for Texas job sites.',
    },
  ]);

  // Demand Forecast state
  const [forecasts, setForecasts] = useState<DemandPrediction[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Diagnostics state
  const [selectedAssetForAnalysis, setSelectedAssetForAnalysis] = useState('EQX1001');
  const [anomalyResult, setAnomalyResult] = useState<AnomalyAnalysis | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || queryLoading) return;

    const userText = queryInput.trim();
    setQueryInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQueryLoading(true);

    try {
      const res = await onFleetQuery(userText);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: res.answer, relatedAssetIds: res.relatedAssetIds },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: `Error processing query: ${err.message}` },
      ]);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleRunForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await onDemandForecast(30);
      setForecasts(res);
    } finally {
      setForecastLoading(false);
    }
  };

  const handleRunAnomalyAnalysis = async () => {
    setAnomalyLoading(true);
    try {
      const res = await onExplainAnomaly(selectedAssetForAnalysis);
      setAnomalyResult(res);
    } finally {
      setAnomalyLoading(false);
    }
  };

  return (
    <div id="ai-predictive-copilot" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Gemini 2.5 Fleet Intelligence Copilot</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                  SERVER-SIDE API
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Predictive machine demand modeling, automated root cause diagnosis for high idle ratios, and natural language operations Q&A.
              </p>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSubTab === 'chat'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fleet Assistant
            </button>
            <button
              onClick={() => {
                setActiveSubTab('demand');
                if (!forecasts) handleRunForecast();
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSubTab === 'demand'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Site Demand Forecast
            </button>
            <button
              onClick={() => {
                setActiveSubTab('diagnostics');
                if (!anomalyResult) handleRunAnomalyAnalysis();
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                activeSubTab === 'diagnostics'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Anomaly Diagnostic
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab 1: Natural Language Fleet Chat */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-lg p-3.5 text-xs ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.relatedAssetIds && msg.relatedAssetIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center space-x-1.5">
                      <span className="text-[11px] text-slate-400">Related Units:</span>
                      {msg.relatedAssetIds.map((id) => (
                        <span
                          key={id}
                          className="font-mono text-[10px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {queryLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-lg p-3 text-xs animate-pulse flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Gemini is analyzing fleet telemetry & contractual logs...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Quick Queries */}
          <div className="bg-slate-800/40 border-t border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 shrink-0">Try asking:</span>
            <button
              onClick={() => setQueryInput('Which machines are currently overdue for return?')}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 whitespace-nowrap"
            >
              Overdue machines?
            </button>
            <button
              onClick={() => setQueryInput('Why is EQX1001 logging 10 hours of idle time?')}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 whitespace-nowrap"
            >
              EQX1001 idle analysis
            </button>
            <button
              onClick={() => setQueryInput('Do we have excavators available for dispatch?')}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-700 whitespace-nowrap"
            >
              Available excavators?
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendQuery} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about fleet utilization, maintenance codes, or customer rentals..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={queryLoading || !queryInput.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-xs flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Sub Tab 2: Site Demand Forecast */}
      {activeSubTab === 'demand' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                30-Day Predictive Job-Site Machine Demand & Logistics Pre-Positioning
              </h3>
              <p className="text-xs text-slate-400">
                Machine learning model evaluating historical usage and construction duration to minimize haulage costs.
              </p>
            </div>
            <button
              onClick={handleRunForecast}
              disabled={forecastLoading}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition shadow-sm"
            >
              {forecastLoading ? 'Forecasting...' : 'Re-calculate Forecast'}
            </button>
          </div>

          {forecasts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forecasts.map((fc) => (
                <div
                  key={fc.siteId}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700 mr-2">
                        {fc.siteId}
                      </span>
                      <span className="font-bold text-white text-sm">{fc.siteName}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>${fc.estimatedCostSavings.toLocaleString()} Est. Savings</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-slate-400 font-medium">Predicted Heavy Machinery Requirements:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {fc.predictedDemand.map((d, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-800/60 p-2.5 rounded border border-slate-700/60 text-xs"
                        >
                          <div className="font-semibold text-slate-200">{d.machineType}</div>
                          <div className="flex justify-between text-slate-400 mt-1">
                            <span>Units: {d.requiredUnits}</span>
                            <span className="text-amber-400 font-mono">
                              {Math.round(d.confidence * 100)}% Conf
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-800/40 rounded p-3 text-xs text-amber-200">
                    <span className="font-bold text-amber-400 block mb-1">Pre-Positioning Recommendation:</span>
                    <p className="leading-relaxed">{fc.prePositioningRecommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub Tab 3: Anomaly Diagnostics */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <label className="text-xs text-slate-300 font-medium">Select Target Asset:</label>
              <select
                value={selectedAssetForAnalysis}
                onChange={(e) => setSelectedAssetForAnalysis(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-3 py-1.5"
              >
                <option value="EQX1001">EQX1001 (Cat 320 - 87% Idle)</option>
                <option value="EQX1002">EQX1002 (RT-60 Crane - Unassigned)</option>
                <option value="EQX1004">EQX1004 (Cat 349 - High Idle)</option>
                <option value="EQX1007">EQX1007 (Cat 323 - 12h Idle)</option>
                <option value="CAT-SS-299-05">CAT-SS-299-05 (Cat 299D3 - DTC Fault)</option>
                <option value="CAT-DZ-D6-02">CAT-DZ-D6-02 (Cat D6 XE - Overdue)</option>
              </select>
            </div>

            <button
              onClick={handleRunAnomalyAnalysis}
              disabled={anomalyLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition shadow-sm"
            >
              {anomalyLoading ? 'Diagnosing Telemetry...' : 'Generate AI Root Cause Diagnosis'}
            </button>
          </div>

          {anomalyResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {anomalyResult.assetModel} ({anomalyResult.assetId})
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    Anomaly Signature: {anomalyResult.anomalyType}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Financial Impact (5-day waste)</div>
                  <div className="text-lg font-bold text-red-400 font-mono">
                    ${anomalyResult.financialImpactUsd.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Root Cause */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Engine Control Module (ECM) Root Cause Analysis:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {anomalyResult.rootCause}
                </p>
              </div>

              {/* Corrective Actions */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Prescriptive Corrective Actions:
                </span>
                <div className="space-y-2">
                  {anomalyResult.correctiveActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 text-xs bg-slate-800/40 border border-slate-700/60 p-3 rounded"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
