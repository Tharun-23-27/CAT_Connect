import { Request, Response, NextFunction } from 'express';
import { alertRepository } from '../repositories/alert.repository.ts';
import { rulesEngineService } from '../services/rulesEngine.service.ts';
import { sendSuccess } from '../utils/apiResponse.ts';
import { AppError } from '../utils/appError.ts';
import { AlertStatus, AlertSeverity, AlertType } from '../constants/index.ts';

export class AlertController {
  public async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, severity, type, assetId } = req.query as {
        status?: AlertStatus;
        severity?: AlertSeverity;
        type?: AlertType;
        assetId?: string;
      };

      const alerts = alertRepository.getAll({ status, severity, type, assetId });
      return sendSuccess({ res, data: alerts, meta: { total: alerts.length } });
    } catch (error) {
      return next(error);
    }
  }

  public async runDetectionCycle(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = rulesEngineService.runDetectionCycle();
      return sendSuccess({
        res,
        data: result,
        message: `Rules engine cycle executed. ${result.newAlertsGenerated} new alert(s) generated.`,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resolutionNotes, resolvedBy } = req.body;

      const updated = rulesEngineService.resolveAlert(id, resolvedBy, resolutionNotes);
      if (!updated) {
        throw new AppError(`Alert '${id}' not found`, 404);
      }

      return sendSuccess({
        res,
        data: updated,
        message: `Alert ${id} marked as RESOLVED`,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const alertController = new AlertController();
