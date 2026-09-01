import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import {
  DemandForecastSchema,
  ExplainAnomalySchema,
  FleetQuerySchema,
} from '../schemas/ai.schema.ts';

const router = Router();

router.post(
  '/demand-forecast',
  validateRequest({ body: DemandForecastSchema }),
  aiController.forecastDemand.bind(aiController)
);

router.post(
  '/explain-anomaly',
  validateRequest({ body: ExplainAnomalySchema }),
  aiController.explainAnomaly.bind(aiController)
);

router.post(
  '/fleet-query',
  validateRequest({ body: FleetQuerySchema }),
  aiController.queryFleet.bind(aiController)
);

export default router;
