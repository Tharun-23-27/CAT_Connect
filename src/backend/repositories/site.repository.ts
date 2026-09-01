import { dbStore } from './dbStore.ts';
import { Site } from '../models/index.ts';

export class SiteRepository {
  public getAll(): Site[] {
    return Array.from(dbStore.sites.values());
  }

  public getById(id: string): Site | undefined {
    return dbStore.sites.get(id);
  }

  public update(id: string, updates: Partial<Site>): Site | undefined {
    const existing = dbStore.sites.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    dbStore.sites.set(id, updated);
    return updated;
  }
}

export const siteRepository = new SiteRepository();
