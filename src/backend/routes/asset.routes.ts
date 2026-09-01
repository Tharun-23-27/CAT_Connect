import { Router } from 'express';
import { assetController } from '../controllers/asset.controller.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import {
  GetAssetsQuerySchema,
  AssetIdParamSchema,
  UpdateAssetStatusSchema,
} from '../schemas/asset.schema.ts';

const router = Router();

router.get('/overview', assetController.getOverview.bind(assetController));
router.get('/telematics/live', assetController.getLiveTelematics.bind(assetController));

router.get(
  '/',
  validateRequest({ query: GetAssetsQuerySchema }),
  assetController.getAssets.bind(assetController)
);

router.get(
  '/:id',
  validateRequest({ params: AssetIdParamSchema }),
  assetController.getAssetById.bind(assetController)
);

router.patch(
  '/:id/status',
  validateRequest({ params: AssetIdParamSchema, body: UpdateAssetStatusSchema }),
  assetController.updateAssetStatus.bind(assetController)
);

export default router;
