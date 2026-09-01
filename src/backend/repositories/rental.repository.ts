import { dbStore } from './dbStore.ts';
import { Rental, RentalStatus } from '../models/index.ts';

export class RentalRepository {
  public getAll(filters?: { status?: RentalStatus; assetId?: string; siteId?: string }): Rental[] {
    let list = Array.from(dbStore.rentals.values());
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.assetId) {
      list = list.filter((r) => r.assetId === filters.assetId);
    }
    if (filters?.siteId) {
      list = list.filter((r) => r.siteId === filters.siteId);
    }
    return list;
  }

  public getById(id: string): Rental | undefined {
    return dbStore.rentals.get(id);
  }

  public getActiveByAssetId(assetId: string): Rental | undefined {
    return Array.from(dbStore.rentals.values()).find(
      (r) =>
        r.assetId === assetId &&
        (r.status === RentalStatus.ACTIVE || r.status === RentalStatus.OVERDUE)
    );
  }

  public create(rental: Rental): Rental {
    dbStore.rentals.set(rental.id, rental);
    return rental;
  }

  public update(id: string, updates: Partial<Rental>): Rental | undefined {
    const existing = dbStore.rentals.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    dbStore.rentals.set(id, updated);
    return updated;
  }
}

export const rentalRepository = new RentalRepository();
