import { z } from 'zod';
import { AssetStatus, MachineType } from '../constants/index.ts';

export const GetAssetsQuerySchema = z.object({
  status: z.nativeEnum(AssetStatus).optional(),
  machineType: z.nativeEnum(MachineType).optional(),
  siteId: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

export const AssetIdParamSchema = z.object({
  id: z.string().min(1, 'Asset ID is required'),
});

export const UpdateAssetStatusSchema = z.object({
  status: z.nativeEnum(AssetStatus),
  siteId: z.string().nullable().optional(),
  assignedOperatorId: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export const CreateAssetSchema = z.object({
  id: z.string().min(3),
  model: z.string().min(2),
  machineType: z.nativeEnum(MachineType),
  serialNumber: z.string().min(3),
  dayRateUsd: z.number().positive(),
  currentSiteId: z.string().nullable().optional(),
  fuelLevelPercent: z.number().min(0).max(100).default(100),
});
