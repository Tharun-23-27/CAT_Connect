import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from './api/client.ts';
import {
  Asset,
  Site,
  Operator,
  Alert,
  FleetOverview,
  TelemetrySummary,
  AssetStatus,
  MachineType,
} from './backend/models/index.ts';

import { Header } from './components/Header.tsx';
import { FleetOverviewCard } from './components/FleetOverviewCard.tsx';
import { AssetList } from './components/AssetList.tsx';
import { TelemetryConsole } from './components/TelemetryConsole.tsx';
import { AlertsPanel } from './components/AlertsPanel.tsx';
import { AiCopilot } from './components/AiCopilot.tsx';
import { RadarMap } from './components/RadarMap.tsx';
import { CheckOutModal } from './components/CheckOutModal.tsx';
import { CheckInModal } from './components/CheckInModal.tsx';
import { ApiDocsModal } from './components/ApiDocsModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'telemetry' | 'alerts' | 'map' | 'ai'>('fleet');
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'CONNECTING' | 'ERROR'>('CONNECTING');

  // Core Data States
  const [overview, setOverview] = useState<FleetOverview | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [telemetrySummary, setTelemetrySummary] = useState<TelemetrySummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [checkOutAsset, setCheckOutAsset] = useState<Asset | null>(null);
  const [checkInAsset, setCheckInAsset] = useState<Asset | null>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Fetch all data from Express API
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        overviewRes,
        assetsRes,
        sitesRes,
        operatorsRes,
        alertsRes,
        summaryRes,
        healthRes,
      ] = await Promise.all([
        apiClient.getOverview(),
        apiClient.getAssets(),
        apiClient.getSites(),
        apiClient.getOperators(),
        apiClient.getAlerts(),
        apiClient.getTelemetrySummary(),
        apiClient.getHealth(),
      ]);

      setOverview(overviewRes);
      setAssets(assetsRes);
      setSites(sitesRes);
      setOperators(operatorsRes);
      setAlerts(alertsRes);
      setTelemetrySummary(summaryRes);
      setServerStatus(healthRes.status === 'HEALTHY' ? 'ONLINE' : 'ERROR');
    } catch (err: any) {
      console.error('Failed to load fleet data:', err);
      setServerStatus('ERROR');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleCheckOutSubmit = async (data: any) => {
    const res = await apiClient.checkOut(data);
    showNotification(
      `Asset ${res.asset.id} dispatched to ${res.rental.siteId} (Contract ${res.rental.contractNumber})`,
      'success'
    );
    await loadData();
  };

  const handleCheckInSubmit = async (data: any) => {
    const res = await apiClient.checkIn(data);
    showNotification(
      `Asset ${res.asset.id} successfully checked in. Invoice billed: $${res.billingSummary.totalCostUsd.toLocaleString()}`,
      'success'
    );
    await loadData();
    return res;
  };

  const handleQuickQrScan = async (asset: Asset) => {
    try {
      const verify = await apiClient.verifyQr(asset.id);
      if (verify.eligibleForCheckOut) {
        setCheckOutAsset(asset);
      } else if (verify.eligibleForCheckIn) {
        setCheckInAsset(asset);
      } else {
        showNotification(`Asset ${asset.id} Status: ${verify.verificationStatus}`, 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'QR Verification failed', 'error');
    }
  };

  const handleFilterChange = async (filters: {
    status?: AssetStatus;
    machineType?: MachineType;
    search?: string;
  }) => {
    try {
      const filtered = await apiClient.getAssets(filters);
      setAssets(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIngestTelemetry = async (data: any) => {
    const res = await apiClient.logTelemetry(data);
    showNotification(
      `CAN telemetry ingested for ${res.assetId}${res.anomalyDetected ? ' (Anomaly Alert Triggered)' : ''}`,
      'success'
    );
    await loadData();
  };

  const handleRunRulesEngine = async () => {
    const res = await apiClient.runDetectionCycle();
    showNotification(
      `Rules Engine complete. Generated ${res.newAlertsGenerated} new alert(s), ${res.overdueRentalsFound} overdues identified.`,
      'success'
    );
    await loadData();
  };

  const handleResolveAlert = async (id: string, notes: string) => {
    await apiClient.resolveAlert(id, notes, 'Lead Field Technician');
    showNotification(`Alert ${id} resolved & cleared.`, 'success');
    await loadData();
  };

  const handleDemandForecast = async (timeframeDays: number) => {
    return await apiClient.demandForecast(timeframeDays);
  };

  const handleExplainAnomaly = async (assetId: string) => {
    return await apiClient.explainAnomaly({ assetId });
  };

  const handleFleetQuery = async (query: string) => {
    return await apiClient.fleetQuery(query);
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {notification && (
        <div
          id="app-toast-notification"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-2xl text-xs font-semibold flex items-center space-x-2 border transition-all animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : 'bg-red-950 border-red-700 text-red-200'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={activeAlertsCount}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        onOpenDocs={() => setShowDocsModal(true)}
        serverStatus={serverStatus}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Fleet Overview KPI Banner */}
        <FleetOverviewCard overview={overview} loading={loading} />

        {/* Tab 1: Fleet Asset Directory & Dispatch Controls */}
        {activeTab === 'fleet' && (
          <AssetList
            assets={assets}
            sites={sites}
            loading={loading}
            onSelectCheckOut={(asset) => setCheckOutAsset(asset)}
            onSelectCheckIn={(asset) => setCheckInAsset(asset)}
            onQuickQrScan={handleQuickQrScan}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Tab 2: CAN-Bus ECM Telematics & Idling Console */}
        {activeTab === 'telemetry' && (
          <TelemetryConsole
            summary={telemetrySummary}
            loading={loading}
            onIngestTelemetry={handleIngestTelemetry}
          />
        )}

        {/* Tab 3: Alerts & Operational Rules Engine */}
        {activeTab === 'alerts' && (
          <AlertsPanel
            alerts={alerts}
            loading={loading}
            onRunRulesEngine={handleRunRulesEngine}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {/* Tab 4: GPS Job Site Radar */}
        {activeTab === 'map' && (
          <RadarMap
            assets={assets}
            sites={sites}
            onSelectAsset={(asset) => {
              if (asset.status === AssetStatus.AVAILABLE) setCheckOutAsset(asset);
              else if (asset.status === AssetStatus.RENTED || asset.status === AssetStatus.OVERDUE)
                setCheckInAsset(asset);
            }}
          />
        )}

        {/* Tab 5: Gemini AI Fleet Intelligence Copilot */}
        {activeTab === 'ai' && (
          <AiCopilot
            onDemandForecast={handleDemandForecast}
            onExplainAnomaly={handleExplainAnomaly}
            onFleetQuery={handleFleetQuery}
          />
        )}
      </main>

      {/* Modals */}
      {checkOutAsset && (
        <CheckOutModal
          asset={checkOutAsset}
          sites={sites}
          operators={operators}
          onClose={() => setCheckOutAsset(null)}
          onSubmit={handleCheckOutSubmit}
        />
      )}

      {checkInAsset && (
        <CheckInModal
          asset={checkInAsset}
          onClose={() => setCheckInAsset(null)}
          onSubmit={handleCheckInSubmit}
        />
      )}

      {showDocsModal && <ApiDocsModal onClose={() => setShowDocsModal(false)} />}
    </div>
  );
}
