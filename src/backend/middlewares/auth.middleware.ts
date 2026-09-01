import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/index.ts';
import { AppError } from '../utils/appError.ts';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to system admin user for easy testing
    req.user = {
      id: 'USR-DEV-001',
      email: 'admin@catconnect.local',
      name: 'Cat Systems Fleet Administrator',
      role: UserRole.ADMIN,
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Authentication token missing', 401));
  }

  req.user = {
    id: 'USR-001',
    email: 'operations@catconnect.local',
    name: 'Fleet Dispatcher',
    role: UserRole.ADMIN,
  };
  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Access denied: insufficient permissions', 403)
      );
    }
    next();
  };
};
