import { Router } from 'express';
import { rentalController } from '../controllers/rental.controller.ts';
import { validateRequest } from '../middlewares/validate.middleware.ts';
import {
  CheckOutRentalSchema,
  CheckInRentalSchema,
  VerifyQrSchema,
} from '../schemas/rental.schema.ts';

const router = Router();

router.get('/', rentalController.getAllRentals.bind(rentalController));
router.get('/active', rentalController.getActiveRentals.bind(rentalController));

router.post(
  '/checkout',
  validateRequest({ body: CheckOutRentalSchema }),
  rentalController.checkOut.bind(rentalController)
);

router.post(
  '/checkin',
  validateRequest({ body: CheckInRentalSchema }),
  rentalController.checkIn.bind(rentalController)
);

router.post(
  '/verify-qr',
  validateRequest({ body: VerifyQrSchema }),
  rentalController.verifyQr.bind(rentalController)
);

export default router;
