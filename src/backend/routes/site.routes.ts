import { Router } from 'express';
import { siteController } from '../controllers/site.controller.ts';

const router = Router();

router.get('/sites', siteController.getSites.bind(siteController));
router.get('/operators', siteController.getOperators.bind(siteController));

export default router;
