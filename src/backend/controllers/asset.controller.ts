import { Request, Response, NextFunction } from 'express';
import { assetService } from '../services/asset.service.ts';
import { sendSuccess } from '../utils/apiResponse.ts';
import { AssetStatus, MachineType } from '../constants/index.ts';

export class AssetController {
  public async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const overview = assetService.getOverview();
      return sendSuccess({ res, data: overview });
    } catch (error) {
      return next(error);
    }
  }

  public async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, machineType, siteId, search } = req.query as {
        status?: AssetStatus;
        machineType?: MachineType;
        siteId?: string;
        search?: string;
      };

      const assets = assetService.getAssets({ status, machineType, siteId, search });
      return sendSuccess({ res, data: assets, meta: { total: assets.length } });
    } catch (error) {
      return next(error);
    }
  }

  public async getAssetById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const asset = assetService.getAssetById(id);
      return sendSuccess({ res, data: asset });
    } catch (error) {
      return next(error);
    }
  }

  public async updateAssetStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, siteId, assignedOperatorId } = req.body;
      const asset = assetService.updateAssetStatus(id, status, siteId, assignedOperatorId);
      return sendSuccess({
        res,
        data: asset,
        message: `Asset ${id} status updated to ${status}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async getLiveTelematics(_req: Request, res: Response, next: NextFunction) {
    try {
      const telematics = assetService.getLiveTelematics();
      return sendSuccess({ res, data: telematics });
    } catch (error) {
      return next(error);
    }
  }
}

export const assetController = new AssetController();
