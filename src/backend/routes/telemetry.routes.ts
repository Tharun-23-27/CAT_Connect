import { Router } from 'express';
import { telemetryController } from '../controllers/telemetry.controller.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import {
  TelemetryLogInSchema,
  AssetTelemetryParamSchema,
} from '../schemas/telemetry.schema.ts';

const router = Router();

router.get('/summary', telemetryController.getSummary.bind(telemetryController));

router.post(
  '/log',
  validateRequest({ body: TelemetryLogInSchema }),
  telemetryController.logTelemetry.bind(telemetryController)
);

router.get(
  '/asset/:assetId',
  validateRequest({ params: AssetTelemetryParamSchema }),
  telemetryController.getLogsByAsset.bind(telemetryController)
);

export default router;
