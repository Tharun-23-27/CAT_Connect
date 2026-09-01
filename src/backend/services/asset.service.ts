import { assetRepository, AssetRepository } from '../repositories/asset.repository.ts';
import { rentalRepository, RentalRepository } from '../repositories/rental.repository.ts';
import {
  Asset,
  AssetStatus,
  FleetOverview,
  MachineType,
  TelemetryLive,
} from '../models/index.ts';
import { AppError } from '../utils/appError.ts';

export class AssetService {
  constructor(
    private readonly assetRepo: AssetRepository = assetRepository,
    private readonly rentalRepo: RentalRepository = rentalRepository
  ) {}

  public getOverview(): FleetOverview {
    const assets = this.assetRepo.getAll();
    const totalUnits = assets.length;

    const rented = assets.filter((a) => a.status === AssetStatus.RENTED).length;
    const available = assets.filter((a) => a.status === AssetStatus.AVAILABLE).length;
    const overdue = assets.filter((a) => a.status === AssetStatus.OVERDUE).length;
    const service = assets.filter((a) => a.status === AssetStatus.MAINTENANCE).length;
    const transit = assets.filter((a) => a.status === AssetStatus.IN_TRANSIT).length;

    const utilizationPercentage =
      totalUnits > 0 ? Math.round(((rented + overdue) / totalUnits) * 100) : 0;

    const averageHealthIndex =
      totalUnits > 0
        ? Math.round(assets.reduce((sum, a) => sum + a.healthIndex, 0) / totalUnits)
        : 0;

    // Active Monthly Revenue based on 30-day billing cycle for rented & overdue units
    const activeMonthlyRevenueUsd = assets
      .filter((a) => a.status === AssetStatus.RENTED || a.status === AssetStatus.OVERDUE)
      .reduce((sum, a) => sum + a.dayRateUsd * 30, 0);

    const projectedMonthlyRevenueUsd = assets.reduce(
      (sum, a) => sum + a.dayRateUsd * 24, // 80% theoretical fleet cap
      0
    );

    return {
      totalUnits,
      rented,
      available,
      overdue,
      service,
      transit,
      utilizationPercentage,
      averageHealthIndex,
      activeMonthlyRevenueUsd,
      projectedMonthlyRevenueUsd,
    };
  }

  public getAssets(filters?: {
    status?: AssetStatus;
    machineType?: MachineType;
    siteId?: string;
    search?: string;
  }): Asset[] {
    return this.assetRepo.getAll(filters);
  }

  public getAssetById(id: string): Asset {
    const asset = this.assetRepo.getById(id);
    if (!asset) {
      throw new AppError(`Asset '${id}' not found in fleet registry`, 404);
    }
    return asset;
  }

  public updateAssetStatus(
    id: string,
    status: AssetStatus,
    siteId?: string | null,
    assignedOperatorId?: string | null
  ): Asset {
    const asset = this.getAssetById(id);
    const updates: Partial<Asset> = { status };

    if (siteId !== undefined) {
      updates.currentSiteId = siteId;
    }
    if (assignedOperatorId !== undefined) {
      updates.assignedOperatorId = assignedOperatorId;
    }

    const updated = this.assetRepo.update(id, updates);
    if (!updated) {
      throw new AppError(`Failed to update asset ${id}`, 500);
    }
    return updated;
  }

  public getLiveTelematics(): { assetId: string; model: string; status: AssetStatus; telemetry: TelemetryLive }[] {
    const assets = this.assetRepo.getAll();
    return assets.map((a) => ({
      assetId: a.id,
      model: a.model,
      status: a.status,
      telemetry: a.telemetryLive,
    }));
  }
}

export const assetService = new AssetService();
