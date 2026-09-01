import { z } from 'zod';

export const DemandForecastSchema = z.object({
  timeframeDays: z.coerce.number().min(7).max(90).default(30).optional(),
  siteId: z.string().optional(),
});

export const ExplainAnomalySchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  anomalyType: z.string().optional(),
  idleHours: z.number().optional(),
  runtimeHours: z.number().optional(),
  diagnosticCodes: z.array(z.string()).optional(),
});

export const FleetQuerySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
  contextSiteId: z.string().optional(),
});
