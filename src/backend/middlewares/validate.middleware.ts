import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError.ts';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as any;
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as any;
      }
      return next();
    } catch (error: any) {
      if (error instanceof ZodError || error.issues) {
        const issuesList = error.issues || error.errors || [];
        const issues = issuesList.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'field'),
          message: err.message,
        }));
        return next(
          new AppError('Request validation failed', 400, { issues })
        );
      }
      return next(error);
    }
  };
};
