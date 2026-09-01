import { dbStore } from './dbStore.ts';
import { TelemetryLog } from '../models/index.ts';

export class TelemetryRepository {
  public getAll(): TelemetryLog[] {
    return [...dbStore.telemetryLogs];
  }

  public getByAssetId(assetId: string): TelemetryLog[] {
    return dbStore.telemetryLogs.filter((t) => t.assetId === assetId);
  }

  public getBySiteId(siteId: string): TelemetryLog[] {
    return dbStore.telemetryLogs.filter((t) => t.siteId === siteId);
  }

  public add(log: TelemetryLog): TelemetryLog {
    dbStore.telemetryLogs.push(log);
    return log;
  }

  public getAnomalies(): TelemetryLog[] {
    return dbStore.telemetryLogs.filter((t) => t.anomalyDetected);
  }
}

export const telemetryRepository = new TelemetryRepository();
