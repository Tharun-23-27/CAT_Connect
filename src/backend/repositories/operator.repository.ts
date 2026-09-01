import { dbStore } from './dbStore.ts';
import { Operator } from '../models/index.ts';

export class OperatorRepository {
  public getAll(): Operator[] {
    return Array.from(dbStore.operators.values());
  }

  public getById(id: string): Operator | undefined {
    return dbStore.operators.get(id);
  }

  public update(id: string, updates: Partial<Operator>): Operator | undefined {
    const existing = dbStore.operators.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    dbStore.operators.set(id, updated);
    return updated;
  }
}

export const operatorRepository = new OperatorRepository();
