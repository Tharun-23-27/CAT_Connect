import { rentalRepository, RentalRepository } from '../repositories/rental.repository.ts';
import { assetRepository, AssetRepository } from '../repositories/asset.repository.ts';
import { alertRepository, AlertRepository } from '../repositories/alert.repository.ts';
import { telemetryRepository, TelemetryRepository } from '../repositories/telemetry.repository.ts';
import {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  AssetStatus,
  RentalStatus,
} from '../models/index.ts';

export interface RuleDetectionResult {
  timestamp: string;
  totalAlertsActive: number;
  newAlertsGenerated: number;
  overdueRentalsFound: number;
  idleAnomaliesFound: number;
  unassignedUsageFound: number;
  dtcCodesFound: number;
  generatedAlerts: Alert[];
}

export class RulesEngineService {
  constructor(
    private readonly rentalRepo: RentalRepository = rentalRepository,
    private readonly assetRepo: AssetRepository = assetRepository,
    private readonly alertRepo: AlertRepository = alertRepository,
    private readonly telemetryRepo: TelemetryRepository = telemetryRepository
  ) {}

  public runDetectionCycle(): RuleDetectionResult {
    const todayStr = new Date().toISOString().split('T')[0];
    const newAlerts: Alert[] = [];
    let overdueCount = 0;
    let idleAnomalyCount = 0;
    let unassignedCount = 0;
    let dtcCount = 0;

    // Rule 1: Detect Overdue Rentals
    const rentals = this.rentalRepo.getAll();
    for (const rental of rentals) {
      if (
        (rental.status === RentalStatus.ACTIVE || rental.status === RentalStatus.OVERDUE) &&
        rental.expectedCheckInDate < todayStr
      ) {
        overdueCount++;
        // Update rental and asset status
        if (rental.status !== RentalStatus.OVERDUE) {
          this.rentalRepo.update(rental.id, { status: RentalStatus.OVERDUE });
        }
        const asset = this.assetRepo.getById(rental.assetId);
        if (asset && asset.status !== AssetStatus.OVERDUE) {
          this.assetRepo.update(asset.id, { status: AssetStatus.OVERDUE });
        }

        const alertId = `ALT-OVD-${rental.assetId}`;
        if (!this.alertRepo.getById(alertId)) {
          const daysOverdue = Math.max(
            1,
            Math.ceil(
              (new Date(todayStr).getTime() - new Date(rental.expectedCheckInDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          const alert: Alert = {
            id: alertId,
            type: AlertType.OVERDUE_RETURN,
            severity: AlertSeverity.CRITICAL,
            assetId: rental.assetId,
            assetModel: asset?.model || 'Heavy Equipment',
            siteId: rental.siteId,
            contractNumber: rental.contractNumber,
            customerName: rental.customerName,
            message: `Contract ${rental.contractNumber} overdue by ${daysOverdue} day(s). Expected check-in was ${rental.expectedCheckInDate}.`,
            status: AlertStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          this.alertRepo.create(alert);
          newAlerts.push(alert);
        }
      }
    }

    // Rule 2: Detect High Idle Anomaly in recent telemetry logs
    const telemetryLogs = this.telemetryRepo.getAll();
    for (const log of telemetryLogs) {
      const asset = this.assetRepo.getById(log.assetId);
      if (!asset) continue;

      const totalHours = log.engineHoursDay + log.idleHoursDay;
      const isHighIdle =
        (log.idleHoursDay >= 8.0 && log.engineHoursDay <= 2.5) ||
        (totalHours > 0 && log.idleHoursDay / totalHours >= 0.7);

      if (isHighIdle) {
        idleAnomalyCount++;
        const alertId = `ALT-IDLE-${asset.id}`;
        if (!this.alertRepo.getById(alertId)) {
          const alert: Alert = {
            id: alertId,
            type: AlertType.HIGH_IDLE_ANOMALY,
            severity: AlertSeverity.WARNING,
            assetId: asset.id,
            assetModel: asset.model,
            siteId: log.siteId || asset.currentSiteId,
            message: `High Idle Anomaly: ${log.idleHoursDay.toFixed(1)}h idle logged vs ${log.engineHoursDay.toFixed(1)}h active runtime. Potential misallocation.`,
            status: AlertStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          this.alertRepo.create(alert);
          newAlerts.push(alert);
        }
      }

      // Rule 3: Detect Unassigned Machine Running (Available in registry but running)
      if (asset.status === AssetStatus.AVAILABLE && log.idleHoursDay + log.engineHoursDay > 2.0) {
        unassignedCount++;
        const alertId = `ALT-UNASSIGNED-${asset.id}`;
        if (!this.alertRepo.getById(alertId)) {
          const alert: Alert = {
            id: alertId,
            type: AlertType.UNASSIGNED_USAGE,
            severity: AlertSeverity.WARNING,
            assetId: asset.id,
            assetModel: asset.model,
            siteId: null,
            message: `Unassigned Machine Operating: ${log.idleHoursDay + log.engineHoursDay}h logged with no active rental contract.`,
            status: AlertStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          this.alertRepo.create(alert);
          newAlerts.push(alert);
        }
      }

      // Rule 4: Diagnostic Fault Codes
      if (log.diagnosticCodes && log.diagnosticCodes.length > 0) {
        dtcCount++;
        const alertId = `ALT-DTC-${asset.id}`;
        if (!this.alertRepo.getById(alertId)) {
          const alert: Alert = {
            id: alertId,
            type: AlertType.DIAGNOSTIC_FAULT_CODE,
            severity: AlertSeverity.CRITICAL,
            assetId: asset.id,
            assetModel: asset.model,
            siteId: log.siteId || asset.currentSiteId,
            message: `CAN-Bus Fault: ${log.diagnosticCodes.join(', ')}. Immediate inspection recommended.`,
            status: AlertStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          this.alertRepo.create(alert);
          newAlerts.push(alert);
        }
      }
    }

    // Also check live telemetry battery voltage drop
    const allAssets = this.assetRepo.getAll();
    for (const a of allAssets) {
      if (a.telemetryLive.batteryVoltage < 23.0 && a.status !== AssetStatus.AVAILABLE) {
        const alertId = `ALT-BATT-${a.id}`;
        if (!this.alertRepo.getById(alertId)) {
          const alert: Alert = {
            id: alertId,
            type: AlertType.MAINTENANCE_DUE,
            severity: AlertSeverity.WARNING,
            assetId: a.id,
            assetModel: a.model,
            siteId: a.currentSiteId,
            message: `Low Battery Voltage Warning: ${a.telemetryLive.batteryVoltage}V detected on ECM bus.`,
            status: AlertStatus.ACTIVE,
            createdAt: new Date().toISOString(),
          };
          this.alertRepo.create(alert);
          newAlerts.push(alert);
        }
      }
    }

    const totalActive = this.alertRepo.getAll({ status: AlertStatus.ACTIVE }).length;

    return {
      timestamp: new Date().toISOString(),
      totalAlertsActive: totalActive,
      newAlertsGenerated: newAlerts.length,
      overdueRentalsFound: overdueCount,
      idleAnomaliesFound: idleAnomalyCount,
      unassignedUsageFound: unassignedCount,
      dtcCodesFound: dtcCount,
      generatedAlerts: newAlerts,
    };
  }

  public resolveAlert(
    alertId: string,
    resolvedBy = 'Field Technician',
    notes = 'Inspected and cleared'
  ): Alert | undefined {
    const alert = this.alertRepo.getById(alertId);
    if (!alert) return undefined;

    return this.alertRepo.update(alertId, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date().toISOString(),
      resolvedBy,
      resolutionNotes: notes,
    });
  }
}

export const rulesEngineService = new RulesEngineService();
