import { Request, Response, NextFunction } from 'express';
import { rentalService } from '../services/rental.service.ts';
import { sendSuccess } from '../utils/apiResponse.ts';

export class RentalController {
  public async getActiveRentals(_req: Request, res: Response, next: NextFunction) {
    try {
      const rentals = rentalService.getActiveRentals();
      return sendSuccess({ res, data: rentals, meta: { total: rentals.length } });
    } catch (error) {
      return next(error);
    }
  }

  public async getAllRentals(_req: Request, res: Response, next: NextFunction) {
    try {
      const rentals = rentalService.getAllRentals();
      return sendSuccess({ res, data: rentals, meta: { total: rentals.length } });
    } catch (error) {
      return next(error);
    }
  }

  public async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const result = rentalService.checkOut(req.body);
      return sendSuccess({
        res,
        statusCode: 201,
        data: result,
        message: `Asset ${result.asset.id} successfully checked out under contract ${result.rental.contractNumber}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = rentalService.checkIn(req.body);
      return sendSuccess({
        res,
        data: result,
        message: `Asset ${result.asset.id} checked in successfully. Total cost: $${result.billingSummary.totalCostUsd.toLocaleString()}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  public async verifyQr(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = rentalService.verifyQr(code);
      return sendSuccess({ res, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

export const rentalController = new RentalController();
