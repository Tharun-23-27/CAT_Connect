import { rentalRepository, RentalRepository } from '../repositories/rental.repository.ts';
import { assetRepository, AssetRepository } from '../repositories/asset.repository.ts';
import { siteRepository, SiteRepository } from '../repositories/site.repository.ts';
import { operatorRepository, OperatorRepository } from '../repositories/operator.repository.ts';
import {
  Rental,
  RentalStatus,
  AssetStatus,
  Asset,
} from '../models/index.ts';
import { AppError } from '../utils/appError.ts';

export interface CheckOutDto {
  assetId: string;
  siteId: string;
  customerName: string;
  operatorId?: string;
  expectedCheckInDate: string;
  initialEngineHours?: number;
  initialFuelPercent?: number;
  dayRateUsd?: number;
  notes?: string;
}

export interface CheckInDto {
  assetId: string;
  returnEngineHours: number;
  returnFuelPercent: number;
  conditionNotes?: string;
  isDamaged?: boolean;
  damageRepairFeeUsd?: number;
}

export class RentalService {
  constructor(
    private readonly rentalRepo: RentalRepository = rentalRepository,
    private readonly assetRepo: AssetRepository = assetRepository,
    private readonly siteRepo: SiteRepository = siteRepository,
    private readonly operatorRepo: OperatorRepository = operatorRepository
  ) {}

  public getActiveRentals(): Rental[] {
    return this.rentalRepo.getAll({ status: RentalStatus.ACTIVE });
  }

  public getAllRentals(): Rental[] {
    return this.rentalRepo.getAll();
  }

  public checkOut(dto: CheckOutDto): { rental: Rental; asset: Asset } {
    const asset = this.assetRepo.getById(dto.assetId);
    if (!asset) {
      throw new AppError(`Asset with ID '${dto.assetId}' not found`, 404);
    }

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new AppError(
        `Asset '${dto.assetId}' is not available for rental. Current status is ${asset.status}.`,
        400
      );
    }

    const site = this.siteRepo.getById(dto.siteId);
    if (!site) {
      throw new AppError(`Target site '${dto.siteId}' not found`, 404);
    }

    const rentalId = `RNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const contractNumber = `CAT-CON-${Date.now().toString().slice(-6)}`;
    const checkOutDate = new Date().toISOString().split('T')[0];

    const initialEngineHours = dto.initialEngineHours ?? asset.totalEngineHours;
    const initialFuelPercent = dto.initialFuelPercent ?? asset.fuelLevelPercent;
    const dayRateUsd = dto.dayRateUsd ?? asset.dayRateUsd;
    const operatorId = dto.operatorId || 'OP-101';

    const newRental: Rental = {
      id: rentalId,
      assetId: asset.id,
      siteId: site.id,
      customerName: dto.customerName,
      operatorId,
      status: RentalStatus.ACTIVE,
      checkOutDate,
      expectedCheckInDate: dto.expectedCheckInDate,
      initialEngineHours,
      initialFuelPercent,
      dayRateUsd,
      notes: dto.notes,
      contractNumber,
    };

    this.rentalRepo.create(newRental);

    // Update Asset State
    const updatedAsset = this.assetRepo.update(asset.id, {
      status: AssetStatus.RENTED,
      currentSiteId: site.id,
      assignedOperatorId: operatorId,
      activeRentalId: rentalId,
    })!;

    // Update Site Active Count
    this.siteRepo.update(site.id, {
      activeMachinesCount: site.activeMachinesCount + 1,
    });

    // Update Operator Assignment
    this.operatorRepo.update(operatorId, {
      assignedAssetId: asset.id,
      assignedSiteId: site.id,
    });

    return { rental: newRental, asset: updatedAsset };
  }

  public checkIn(dto: CheckInDto): { rental: Rental; asset: Asset; billingSummary: any } {
    const asset = this.assetRepo.getById(dto.assetId);
    if (!asset) {
      throw new AppError(`Asset '${dto.assetId}' not found`, 404);
    }

    const rental = this.rentalRepo.getActiveByAssetId(dto.assetId);
    if (!rental) {
      throw new AppError(`No active rental found for asset '${dto.assetId}'`, 400);
    }

    const actualCheckInDate = new Date().toISOString().split('T')[0];
    const initialHours = rental.initialEngineHours;
    const returnHours = dto.returnEngineHours;

    if (returnHours < initialHours) {
      throw new AppError(
        `Return engine hours (${returnHours}) cannot be lower than checkout hours (${initialHours})`,
        400
      );
    }

    const hoursUtilized = Math.max(0, returnHours - initialHours);

    // Days calculation
    const start = new Date(rental.checkOutDate).getTime();
    const end = new Date(actualCheckInDate).getTime();
    const daysRented = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    // Overdue calculation
    const expectedEnd = new Date(rental.expectedCheckInDate).getTime();
    const overdueDays = Math.max(0, Math.ceil((end - expectedEnd) / (1000 * 60 * 60 * 24)));
    const overduePenaltyUsd = overdueDays * (rental.overdueDailyPenaltyUsd || 350);

    // Fuel deficiency calculation ($3.50 per missing % point)
    const fuelDeficit = Math.max(0, rental.initialFuelPercent - dto.returnFuelPercent);
    const fuelChargeUsd = fuelDeficit * 3.5;

    const baseRentalCostUsd = daysRented * rental.dayRateUsd;
    const damageFeeUsd = dto.damageRepairFeeUsd || 0;
    const totalCostUsd = baseRentalCostUsd + overduePenaltyUsd + fuelChargeUsd + damageFeeUsd;

    const updatedRental = this.rentalRepo.update(rental.id, {
      status: RentalStatus.RETURNED,
      actualCheckInDate,
      returnEngineHours: returnHours,
      returnFuelPercent: dto.returnFuelPercent,
      totalCostUsd,
      fuelRefillFeePerPercentUsd: fuelChargeUsd,
      overdueDailyPenaltyUsd: overduePenaltyUsd,
      notes: dto.conditionNotes
        ? `${rental.notes || ''} | Return Note: ${dto.conditionNotes}`
        : rental.notes,
    })!;

    // Release machine to AVAILABLE or MAINTENANCE
    const nextStatus = dto.isDamaged ? AssetStatus.MAINTENANCE : AssetStatus.AVAILABLE;
    const currentSiteId = rental.siteId;

    const updatedAsset = this.assetRepo.update(asset.id, {
      status: nextStatus,
      currentSiteId: null,
      assignedOperatorId: null,
      activeRentalId: null,
      totalEngineHours: returnHours,
      fuelLevelPercent: dto.returnFuelPercent,
      telemetryLive: {
        ...asset.telemetryLive,
        engineHours: returnHours,
        fuelPercent: dto.returnFuelPercent,
        engineRpm: 0,
        hydraulicPressurePsi: 0,
        lastUpdated: new Date().toISOString(),
      },
    })!;

    // Decrease active machines at site
    const site = this.siteRepo.getById(currentSiteId);
    if (site && site.activeMachinesCount > 0) {
      this.siteRepo.update(site.id, {
        activeMachinesCount: site.activeMachinesCount - 1,
      });
    }

    const billingSummary = {
      contractNumber: rental.contractNumber,
      customerName: rental.customerName,
      daysRented,
      overdueDays,
      baseRentalCostUsd,
      overduePenaltyUsd,
      fuelDeficitPercent: fuelDeficit,
      fuelChargeUsd,
      damageFeeUsd,
      totalCostUsd,
      hoursUtilized,
    };

    return { rental: updatedRental, asset: updatedAsset, billingSummary };
  }

  public verifyQr(code: string): {
    asset: Asset;
    activeRental?: Rental;
    eligibleForCheckOut: boolean;
    eligibleForCheckIn: boolean;
    verificationStatus: string;
  } {
    const asset = this.assetRepo.getByQr(code);
    if (!asset) {
      throw new AppError(`No asset found matching QR/RFID code '${code}'`, 404);
    }

    const activeRental = this.rentalRepo.getActiveByAssetId(asset.id);
    const eligibleForCheckOut = asset.status === AssetStatus.AVAILABLE;
    const eligibleForCheckIn =
      asset.status === AssetStatus.RENTED || asset.status === AssetStatus.OVERDUE;

    let verificationStatus = 'READY_FOR_DISPATCH';
    if (asset.status === AssetStatus.RENTED) verificationStatus = 'ACTIVE_ON_JOB_SITE';
    if (asset.status === AssetStatus.OVERDUE) verificationStatus = 'OVERDUE_ON_SITE';
    if (asset.status === AssetStatus.MAINTENANCE) verificationStatus = 'UNDER_MAINTENANCE_INSPECTION';

    return {
      asset,
      activeRental,
      eligibleForCheckOut,
      eligibleForCheckIn,
      verificationStatus,
    };
  }
}

export const rentalService = new RentalService();
