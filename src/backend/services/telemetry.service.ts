import { telemetryRepository, TelemetryRepository } from '../repositories/telemetry.repository.ts';
import { assetRepository, AssetRepository } from '../repositories/asset.repository.ts';
import { siteRepository, SiteRepository } from '../repositories/site.repository.ts';
import { alertRepository, AlertRepository } from '../repositories/alert.repository.ts';
import {
  TelemetryLog,
  TelemetrySummary,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from '../models/index.ts';
import { AppError } from '../utils/appError.ts';

export class TelemetryService {
  constructor(
    private readonly telemetryRepo: TelemetryRepository = telemetryRepository,
    private readonly assetRepo: AssetRepository = assetRepository,
    private readonly siteRepo: SiteRepository = siteRepository,
    private readonly alertRepo: AlertRepository = alertRepository
  ) {}

  public logTelemetry(dto: {
    assetId: string;
    siteId?: string | null;
    operatorId?: string | null;
    engineHoursDay: number;
    idleHoursDay: number;
    fuelConsumedLiters: number;
    diagnosticCodes?: string[];
    batteryVoltage?: number;
    hydraulicPressurePsi?: number;
    lat?: number;
    lng?: number;
    timestamp?: string;
  }): TelemetryLog {
    const asset = this.assetRepo.getById(dto.assetId);
    if (!asset) {
      throw new AppError(`Asset with ID '${dto.assetId}' not found`, 404);
    }

    const totalDayHours = dto.engineHoursDay + dto.idleHoursDay;
    const idlePercentage = totalDayHours > 0 ? (dto.idleHoursDay / totalDayHours) * 100 : 0;
    const isAnomaly =
      idlePercentage > 65 ||
      dto.idleHoursDay >= 8.0 ||
      (dto.diagnosticCodes && dto.diagnosticCodes.length > 0) ||
      (dto.engineHoursDay === 0 && dto.idleHoursDay > 5);

    const log: TelemetryLog = {
      id: `LOG-${Date.now()}`,
      assetId: dto.assetId,
      siteId: dto.siteId ?? asset.currentSiteId,
      operatorId: dto.operatorId ?? asset.assignedOperatorId,
      daysDuration: 1,
      engineHoursDay: dto.engineHoursDay,
      idleHoursDay: dto.idleHoursDay,
      fuelConsumedLiters: dto.fuelConsumedLiters,
      diagnosticCodes: dto.diagnosticCodes || [],
      batteryVoltage: dto.batteryVoltage,
      hydraulicPressurePsi: dto.hydraulicPressurePsi,
      anomalyDetected: isAnomaly,
      timestamp: dto.timestamp || new Date().toISOString(),
    };

    this.telemetryRepo.add(log);

    // Update live telematics state in asset
    this.assetRepo.update(asset.id, {
      totalEngineHours: asset.totalEngineHours + dto.engineHoursDay,
      totalIdleHours: asset.totalIdleHours + dto.idleHoursDay,
      telemetryLive: {
        ...asset.telemetryLive,
        lat: dto.lat ?? asset.telemetryLive.lat,
        lng: dto.lng ?? asset.telemetryLive.lng,
        batteryVoltage: dto.batteryVoltage ?? asset.telemetryLive.batteryVoltage,
        hydraulicPressurePsi:
          dto.hydraulicPressurePsi ?? asset.telemetryLive.hydraulicPressurePsi,
        engineHours: asset.totalEngineHours + dto.engineHoursDay,
        idleHours: asset.totalIdleHours + dto.idleHoursDay,
        lastUpdated: new Date().toISOString(),
      },
    });

    // Create an alert if high idle anomaly or DTC code was logged
    if (isAnomaly) {
      if (dto.diagnosticCodes && dto.diagnosticCodes.length > 0) {
        this.alertRepo.create({
          id: `ALT-DTC-${asset.id}-${Date.now()}`,
          type: AlertType.DIAGNOSTIC_FAULT_CODE,
          severity: AlertSeverity.CRITICAL,
          assetId: asset.id,
          assetModel: asset.model,
          siteId: asset.currentSiteId,
          message: `Active Diagnostic Code logged: ${dto.diagnosticCodes.join(', ')}.`,
          status: AlertStatus.ACTIVE,
          createdAt: new Date().toISOString(),
        });
      } else if (dto.idleHoursDay >= 8.0) {
        this.alertRepo.create({
          id: `ALT-IDLE-${asset.id}-${Date.now()}`,
          type: AlertType.HIGH_IDLE_ANOMALY,
          severity: AlertSeverity.WARNING,
          assetId: asset.id,
          assetModel: asset.model,
          siteId: asset.currentSiteId,
          message: `Excessive Idle Alert: ${dto.idleHoursDay.toFixed(1)}h idle logged vs ${dto.engineHoursDay.toFixed(1)}h runtime.`,
          status: AlertStatus.ACTIVE,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return log;
  }

  public getSummary(): TelemetrySummary {
    const logs = this.telemetryRepo.getAll();
    const sites = this.siteRepo.getAll();

    const totalEngineHours = logs.reduce((sum, l) => sum + l.engineHoursDay, 0);
    const totalIdleHours = logs.reduce((sum, l) => sum + l.idleHoursDay, 0);
    const totalRentedHours = totalEngineHours + totalIdleHours;

    const overallIdlePercentage =
      totalRentedHours > 0 ? Math.round((totalIdleHours / totalRentedHours) * 100) : 0;

    const totalFuelConsumedLiters = logs.reduce((sum, l) => sum + l.fuelConsumedLiters, 0);

    // Fuel waste calculation: approx 3.8 L/hr idling for heavy machinery @ $1.25/L
    const estimatedIdlingFuelWasteUsd = Math.round(totalIdleHours * 3.8 * 1.25);

    const siteBreakdown = sites.map((s) => {
      const siteLogs = logs.filter((l) => l.siteId === s.id);
      const siteEngineHours = siteLogs.reduce((sum, l) => sum + l.engineHoursDay, 0);
      const siteIdleHours = siteLogs.reduce((sum, l) => sum + l.idleHoursDay, 0);
      const siteFuel = siteLogs.reduce((sum, l) => sum + l.fuelConsumedLiters, 0);
      const downtimeHours = siteIdleHours;
      const misallocationLossUsd = Math.round(siteIdleHours * 65); // $65/hr opportunity and wear cost

      return {
        siteId: s.id,
        siteName: s.name,
        engineHours: Math.round(siteEngineHours * 10) / 10,
        idleHours: Math.round(siteIdleHours * 10) / 10,
        fuelConsumedLiters: Math.round(siteFuel),
        downtimeHours: Math.round(downtimeHours * 10) / 10,
        misallocationLossUsd,
      };
    });

    return {
      totalRentedHours: Math.round(totalRentedHours * 10) / 10,
      totalEngineHours: Math.round(totalEngineHours * 10) / 10,
      totalIdleHours: Math.round(totalIdleHours * 10) / 10,
      overallIdlePercentage,
      totalFuelConsumedLiters: Math.round(totalFuelConsumedLiters),
      estimatedIdlingFuelWasteUsd,
      siteBreakdown,
    };
  }

  public getLogsByAsset(assetId: string): TelemetryLog[] {
    return this.telemetryRepo.getByAssetId(assetId);
  }
}

export const telemetryService = new TelemetryService();
