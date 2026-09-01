import { Response } from 'express';

export interface ApiResponseMeta {
  timestamp: string;
  [key: string]: any;
}

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  data,
  message,
  meta,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
};

export const sendError = (
  res: Response,
  statusCode = 500,
  message = 'Internal Server Error',
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
};
