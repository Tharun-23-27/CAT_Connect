import { dbStore } from './dbStore.ts';
import { Alert, AlertStatus, AlertSeverity, AlertType } from '../models/index.ts';

export class AlertRepository {
  public getAll(filters?: {
    status?: AlertStatus;
    severity?: AlertSeverity;
    type?: AlertType;
    assetId?: string;
  }): Alert[] {
    let list = Array.from(dbStore.alerts.values());
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.severity) {
      list = list.filter((a) => a.severity === filters.severity);
    }
    if (filters?.type) {
      list = list.filter((a) => a.type === filters.type);
    }
    if (filters?.assetId) {
      list = list.filter((a) => a.assetId === filters.assetId);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): Alert | undefined {
    return dbStore.alerts.get(id);
  }

  public create(alert: Alert): Alert {
    dbStore.alerts.set(alert.id, alert);
    return alert;
  }

  public update(id: string, updates: Partial<Alert>): Alert | undefined {
    const existing = dbStore.alerts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    dbStore.alerts.set(id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return dbStore.alerts.delete(id);
  }
}

export const alertRepository = new AlertRepository();
