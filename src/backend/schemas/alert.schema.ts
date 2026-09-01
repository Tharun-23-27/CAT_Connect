import { z } from 'zod';
import { AlertStatus, AlertSeverity, AlertType } from '../constants/index.ts';

export const GetAlertsQuerySchema = z.object({
  status: z.nativeEnum(AlertStatus).optional(),
  severity: z.nativeEnum(AlertSeverity).optional(),
  type: z.nativeEnum(AlertType).optional(),
  assetId: z.string().optional(),
});

export const AlertIdParamSchema = z.object({
  id: z.string().min(1, 'Alert ID is required'),
});

export const ResolveAlertSchema = z.object({
  resolutionNotes: z.string().min(3, 'Resolution notes are required (min 3 chars)'),
  resolvedBy: z.string().optional().default('Field Tech #402'),
});
