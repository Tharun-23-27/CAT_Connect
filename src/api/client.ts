import {
  Asset,
  Rental,
  TelemetryLog,
  Site,
  Operator,
  Alert,
  FleetOverview,
  TelemetrySummary,
  DemandPrediction,
  AnomalyAnalysis,
  AssetStatus,
  MachineType,
} from '../backend/models/index.ts';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer demo_admin_token',
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    const errorMsg =
      json.error?.message || json.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as any;
    err.details = json.error?.details;
    err.statusCode = res.status;
    throw err;
  }

  return json.data !== undefined ? json.data : json;
}

export const apiClient = {
  // System
  getHealth: () => fetchJson<{ status: string; uptimeSeconds: number }>(`${BASE_URL}/health`),
  getDocs: () => fetchJson<{ version: string; endpoints: any[] }>(`${BASE_URL}/docs`),

  // Assets
  getOverview: () => fetchJson<FleetOverview>(`${BASE_URL}/assets/overview`),
  getAssets: (filters?: {
    status?: AssetStatus;
    machineType?: MachineType;
    siteId?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.machineType) params.set('machineType', filters.machineType);
    if (filters?.siteId) params.set('siteId', filters.siteId);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return fetchJson<Asset[]>(`${BASE_URL}/assets${qs ? `?${qs}` : ''}`);
  },
  getAssetById: (id: string) => fetchJson<Asset>(`${BASE_URL}/assets/${id}`),
  updateAssetStatus: (id: string, body: { status: AssetStatus; siteId?: string | null; assignedOperatorId?: string | null }) =>
    fetchJson<Asset>(`${BASE_URL}/assets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getLiveTelematics: () =>
    fetchJson<{ assetId: string; model: string; status: AssetStatus; telemetry: any }[]>(
      `${BASE_URL}/assets/telematics/live`
    ),

  // Rentals
  getActiveRentals: () => fetchJson<Rental[]>(`${BASE_URL}/rentals/active`),
  getAllRentals: () => fetchJson<Rental[]>(`${BASE_URL}/rentals`),
  checkOut: (data: {
    assetId: string;
    siteId: string;
    customerName: string;
    operatorId?: string;
    expectedCheckInDate: string;
    initialEngineHours?: number;
    initialFuelPercent?: number;
    dayRateUsd?: number;
    notes?: string;
  }) =>
    fetchJson<{ rental: Rental; asset: Asset }>(`${BASE_URL}/rentals/checkout`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkIn: (data: {
    assetId: string;
    returnEngineHours: number;
    returnFuelPercent: number;
    conditionNotes?: string;
    isDamaged?: boolean;
    damageRepairFeeUsd?: number;
  }) =>
    fetchJson<{ rental: Rental; asset: Asset; billingSummary: any }>(`${BASE_URL}/rentals/checkin`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyQr: (code: string) =>
    fetchJson<{
      asset: Asset;
      activeRental?: Rental;
      eligibleForCheckOut: boolean;
      eligibleForCheckIn: boolean;
      verificationStatus: string;
    }>(`${BASE_URL}/rentals/verify-qr`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Telemetry
  logTelemetry: (data: any) =>
    fetchJson<TelemetryLog>(`${BASE_URL}/telemetry/log`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTelemetrySummary: () => fetchJson<TelemetrySummary>(`${BASE_URL}/telemetry/summary`),
  getAssetTelemetryLogs: (assetId: string) =>
    fetchJson<TelemetryLog[]>(`${BASE_URL}/telemetry/asset/${assetId}`),

  // Alerts
  getAlerts: (filters?: { status?: string; severity?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.severity) params.set('severity', filters.severity);
    const qs = params.toString();
    return fetchJson<Alert[]>(`${BASE_URL}/alerts${qs ? `?${qs}` : ''}`);
  },
  runDetectionCycle: () =>
    fetchJson<any>(`${BASE_URL}/alerts/run-detection`, {
      method: 'POST',
    }),
  resolveAlert: (id: string, resolutionNotes: string, resolvedBy?: string) =>
    fetchJson<Alert>(`${BASE_URL}/alerts/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNotes, resolvedBy }),
    }),

  // Predictive AI
  demandForecast: (timeframeDays = 30, siteId?: string) =>
    fetchJson<DemandPrediction[]>(`${BASE_URL}/ai/demand-forecast`, {
      method: 'POST',
      body: JSON.stringify({ timeframeDays, siteId }),
    }),
  explainAnomaly: (data: {
    assetId: string;
    anomalyType?: string;
    idleHours?: number;
    runtimeHours?: number;
    diagnosticCodes?: string[];
  }) =>
    fetchJson<AnomalyAnalysis>(`${BASE_URL}/ai/explain-anomaly`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  fleetQuery: (query: string, contextSiteId?: string) =>
    fetchJson<{ answer: string; relatedAssetIds: string[]; confidence: number }>(
      `${BASE_URL}/ai/fleet-query`,
      {
        method: 'POST',
        body: JSON.stringify({ query, contextSiteId }),
      }
    ),

  // Sites & Operators
  getSites: () => fetchJson<Site[]>(`${BASE_URL}/sites`),
  getOperators: () => fetchJson<Operator[]>(`${BASE_URL}/operators`),
};
