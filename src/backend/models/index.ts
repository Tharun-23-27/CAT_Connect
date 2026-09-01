import {
  AssetStatus,
  MachineType,
  RentalStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  UserRole,
} from '../constants/index.ts';

export {
  AssetStatus,
  MachineType,
  RentalStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  UserRole,
};

export interface TelemetryLive {
  lat: number;
  lng: number;
  engineRpm: number;
  fuelPercent: number;
  hydraulicPressurePsi: number;
  batteryVoltage: number;
  coolantTempC: number;
  engineHours: number;
  idleHours: number;
  lastUpdated: string;
}

export interface Asset {
  id: string; // e.g. 'EQX1001', 'CAT-320-01'
  model: string; // e.g. 'Cat 320 Hydraulic Excavator'
  machineType: MachineType;
  serialNumber: string;
  status: AssetStatus;
  healthIndex: number; // 0 - 100
  totalEngineHours: number;
  totalIdleHours: number;
  fuelLevelPercent: number;
  dayRateUsd: number;
  currentSiteId: string | null;
  assignedOperatorId: string | null;
  activeRentalId: string | null;
  qrCode: string;
  telemetryLive: TelemetryLive;
  lastServiceDate: string;
  nextServiceHours: number;
}

export interface Rental {
  id: string;
  assetId: string;
  siteId: string;
  customerName: string;
  operatorId: string;
  status: RentalStatus;
  checkOutDate: string;
  expectedCheckInDate: string;
  actualCheckInDate?: string;
  initialEngineHours: number;
  returnEngineHours?: number;
  initialFuelPercent: number;
  returnFuelPercent?: number;
  dayRateUsd: number;
  fuelRefillFeePerPercentUsd?: number;
  overdueDailyPenaltyUsd?: number;
  totalCostUsd?: number;
  notes?: string;
  contractNumber: string;
}

export interface TelemetryLog {
  id: string;
  assetId: string;
  siteId: string | null;
  operatorId: string | null;
  timestamp: string;
  daysDuration: number;
  engineHoursDay: number;
  idleHoursDay: number;
  fuelConsumedLiters: number;
  diagnosticCodes: string[];
  batteryVoltage?: number;
  hydraulicPressurePsi?: number;
  anomalyDetected?: boolean;
}

export interface Site {
  id: string; // e.g. 'S001', 'S002'
  name: string;
  customer: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  requiredMachineTypes: MachineType[];
  activeMachinesCount: number;
  projectedDurationDays: number;
}

export interface Operator {
  id: string; // e.g. 'OP-101'
  name: string;
  certifications: MachineType[];
  experienceYears: number;
  assignedAssetId: string | null;
  assignedSiteId: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'OFF_DUTY';
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  assetId: string;
  assetModel: string;
  siteId: string | null;
  contractNumber?: string;
  customerName?: string;
  message: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface FleetOverview {
  totalUnits: number;
  rented: number;
  available: number;
  overdue: number;
  service: number;
  transit: number;
  utilizationPercentage: number;
  averageHealthIndex: number;
  activeMonthlyRevenueUsd: number;
  projectedMonthlyRevenueUsd: number;
}

export interface TelemetrySummary {
  totalRentedHours: number;
  totalEngineHours: number;
  totalIdleHours: number;
  overallIdlePercentage: number;
  totalFuelConsumedLiters: number;
  estimatedIdlingFuelWasteUsd: number;
  siteBreakdown: {
    siteId: string;
    siteName: string;
    engineHours: number;
    idleHours: number;
    fuelConsumedLiters: number;
    downtimeHours: number;
    misallocationLossUsd: number;
  }[];
}

export interface DemandPrediction {
  siteId: string;
  siteName: string;
  predictedDemand: {
    machineType: MachineType;
    requiredUnits: number;
    confidence: number;
    estimatedStartDate: string;
  }[];
  prePositioningRecommendation: string;
  estimatedCostSavings: number;
}

export interface AnomalyAnalysis {
  assetId: string;
  assetModel: string;
  anomalyType: string;
  idleRatio?: number;
  financialImpactUsd: number;
  rootCause: string;
  correctiveActions: string[];
}
