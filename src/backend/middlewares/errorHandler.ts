import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.ts';
import { sendError } from '../utils/apiResponse.ts';
import { config } from '../config/env.ts';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  console.error('[Unhandled Server Error]:', err);

  const message = config.isDev
    ? err.message || 'Internal Server Error'
    : 'An unexpected internal error occurred';

  const details = config.isDev ? { stack: err.stack } : undefined;

  return sendError(res, 500, message, details);
};
