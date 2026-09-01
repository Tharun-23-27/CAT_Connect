import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class AiController {
  public async forecastDemand(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeframeDays, siteId } = req.body;
      const predictions = await aiService.forecastDemand(timeframeDays, siteId);
      return sendSuccess({ res, data: predictions });
    } catch (error) {
      return next(error);
    }
  }

  public async explainAnomaly(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await aiService.explainAnomaly(req.body);
      return sendSuccess({ res, data: analysis });
    } catch (error) {
      return next(error);
    }
  }

  public async queryFleet(req: Request, res: Response, next: NextFunction) {
    try {
      const { query, contextSiteId } = req.body;
      const result = await aiService.queryFleet(query, contextSiteId);
      return sendSuccess({ res, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

export const aiController = new AiController();
