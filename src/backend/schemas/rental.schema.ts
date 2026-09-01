import { z } from 'zod';

export const CheckOutRentalSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  siteId: z.string().min(1, 'Job Site ID is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  operatorId: z.string().optional().default('OP-101'),
  expectedCheckInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)'),
  initialEngineHours: z.number().min(0).optional(),
  initialFuelPercent: z.number().min(0).max(100).default(100),
  dayRateUsd: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const CheckInRentalSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  returnEngineHours: z.number().min(0, 'Return engine hours must be positive'),
  returnFuelPercent: z.number().min(0).max(100, 'Fuel percentage must be 0-100'),
  conditionNotes: z.string().optional(),
  isDamaged: z.boolean().optional().default(false),
  damageRepairFeeUsd: z.number().min(0).optional().default(0),
});

export const VerifyQrSchema = z.object({
  code: z.string().min(1, 'QR / RFID code is required'),
});

export const RentalIdParamSchema = z.object({
  id: z.string().min(1, 'Rental ID is required'),
});
