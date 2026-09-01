import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.router.ts';
import { authenticate } from './middlewares/auth.middleware.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

export const createExpressApp = () => {
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger in dev
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
      console.log(`[API] ${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // Auth Middleware
  app.use('/api/v1', authenticate);

  // Mount API v1 Routes
  app.use('/api/v1', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
