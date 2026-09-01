import { Request, Response, NextFunction } from 'express';
import { siteRepository } from '../repositories/site.repository.ts';
import { operatorRepository } from '../repositories/operator.repository.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class SiteController {
  public async getSites(_req: Request, res: Response, next: NextFunction) {
    try {
      const sites = siteRepository.getAll();
      return sendSuccess({ res, data: sites, meta: { total: sites.length } });
    } catch (error) {
      return next(error);
    }
  }

  public async getOperators(_req: Request, res: Response, next: NextFunction) {
    try {
      const operators = operatorRepository.getAll();
      return sendSuccess({ res, data: operators, meta: { total: operators.length } });
    } catch (error) {
      return next(error);
    }
  }
}

export const siteController = new SiteController();
