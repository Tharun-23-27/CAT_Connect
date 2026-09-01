import { Request, Response, NextFunction } from 'express';
import { telemetryService } from '../services/telemetry.service.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class TelemetryController {
  public async logTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const log = telemetryService.logTelemetry(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        data: log,
        message: `Telemetry ingested for asset ${log.assetId}${log.anomalyDetected ? ' (Anomaly flagged)' : ''}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = telemetryService.getSummary();
      return sendSuccess({ res, data: summary });
    } catch (error) {
      return next(error);
    }
  }

  public async getLogsByAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { assetId } = req.params;
      const logs = telemetryService.getLogsByAsset(assetId);
      return sendSuccess({ res, data: logs, meta: { total: logs.length } });
    } catch (error) {
      return next(error);
    }
  }
}

export const telemetryController = new TelemetryController();
