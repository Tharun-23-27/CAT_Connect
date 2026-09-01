import { z } from 'zod';

export const TelemetryLogInSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  siteId: z.string().nullable().optional(),
  operatorId: z.string().nullable().optional(),
  engineHoursDay: z.number().min(0, 'Engine hours must be non-negative'),
  idleHoursDay: z.number().min(0, 'Idle hours must be non-negative'),
  fuelConsumedLiters: z.number().min(0, 'Fuel consumed must be non-negative'),
  diagnosticCodes: z.array(z.string()).default([]),
  batteryVoltage: z.number().optional(),
  hydraulicPressurePsi: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  timestamp: z.string().optional(),
});

export const AssetTelemetryParamSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
});
