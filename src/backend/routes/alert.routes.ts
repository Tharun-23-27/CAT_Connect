import { Router } from 'express';
import { alertController } from '../controllers/alert.controller.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import {
  GetAlertsQuerySchema,
  AlertIdParamSchema,
  ResolveAlertSchema,
} from '../schemas/alert.schema.ts';

const router = Router();

router.get(
  '/',
  validateRequest({ query: GetAlertsQuerySchema }),
  alertController.getAlerts.bind(alertController)
);

router.post('/run-detection', alertController.runDetectionCycle.bind(alertController));

router.patch(
  '/:id/resolve',
  validateRequest({ params: AlertIdParamSchema, body: ResolveAlertSchema }),
  alertController.resolveAlert.bind(alertController)
);

export default router;
