import { dbStore } from './dbStore.ts';
import { Asset, AssetStatus, MachineType } from '../models/index.ts';

export class AssetRepository {
  public getAll(filters?: {
    status?: AssetStatus;
    machineType?: MachineType;
    siteId?: string;
    search?: string;
  }): Asset[] {
    let list = Array.from(dbStore.assets.values());

    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.machineType) {
      list = list.filter((a) => a.machineType === filters.machineType);
    }
    if (filters?.siteId) {
      list = list.filter((a) => a.currentSiteId === filters.siteId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          (a.currentSiteId && a.currentSiteId.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getById(id: string): Asset | undefined {
    return dbStore.assets.get(id);
  }

  public getByQr(qrCode: string): Asset | undefined {
    return Array.from(dbStore.assets.values()).find(
      (a) => a.qrCode === qrCode || a.id === qrCode || `QR-${a.id}` === qrCode
    );
  }

  public update(id: string, updates: Partial<Asset>): Asset | undefined {
    const existing = dbStore.assets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    dbStore.assets.set(id, updated);
    return updated;
  }

  public create(asset: Asset): Asset {
    dbStore.assets.set(asset.id, asset);
    return asset;
  }
}

export const assetRepository = new AssetRepository();
