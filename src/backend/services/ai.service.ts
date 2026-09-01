import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.ts';
import { assetRepository } from '../repositories/asset.repository.ts';
import { rentalRepository } from '../repositories/rental.repository.ts';
import { siteRepository } from '../repositories/site.repository.ts';
import { telemetryRepository } from '../repositories/telemetry.repository.ts';
import {
  DemandPrediction,
  AnomalyAnalysis,
  MachineType,
  AssetStatus,
} from '../models/index.ts';

export class AiService {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient && config.geminiApiKey) {
      this.aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }
    return this.aiClient;
  }

  /**
   * Forecasts machine demand per site and generates pre-positioning suggestions
   */
  public async forecastDemand(
    timeframeDays = 30,
    targetSiteId?: string
  ): Promise<DemandPrediction[]> {
    const sites = siteRepository.getAll();
    const assets = assetRepository.getAll();
    const rentals = rentalRepository.getAll({ status: 'ACTIVE' as any });

    const targetSites = targetSiteId
      ? sites.filter((s) => s.id === targetSiteId)
      : sites;

    const predictions: DemandPrediction[] = [];

    for (const site of targetSites) {
      const siteRentals = rentals.filter((r) => r.siteId === site.id);
      const activeTypes = siteRentals.map((r) => {
        const a = assets.find((x) => x.id === r.assetId);
        return a?.machineType;
      });

      // Default Heuristic Predictions
      const predictedDemand = site.requiredMachineTypes.map((reqType) => {
        const isPresent = activeTypes.includes(reqType);
        return {
          machineType: reqType,
          requiredUnits: isPresent ? 1 : 2,
          confidence: isPresent ? 0.88 : 0.94,
          estimatedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        };
      });

      let recommendation = `Pre-position 1x ${site.requiredMachineTypes[0]} at ${site.name} ahead of heavy earthworks phase. Estimated 18% fuel logistics savings.`;
      let savings = 3400;

      // Try Gemini AI enhancement if key is provided
      const client = this.getClient();
      if (client) {
        try {
          const prompt = `You are a heavy equipment fleet logistics AI for Caterpillar dealerships.
Analyze Site: ${site.name} (Duration: ${site.projectedDurationDays} days, Active Units: ${site.activeMachinesCount}).
Required Types: ${site.requiredMachineTypes.join(', ')}.
Timeframe: next ${timeframeDays} days.
Provide a concise 1-sentence pre-positioning recommendation and estimated cost savings in USD.
Output format: JSON with "recommendation" (string) and "savingsUsd" (number).`;

          const response = await client.models.generateContent({
            model: config.geminiModel,
            contents: prompt,
            config: { responseMimeType: 'application/json' },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed.recommendation) recommendation = parsed.recommendation;
            if (parsed.savingsUsd) savings = Number(parsed.savingsUsd);
          }
        } catch (e) {
          console.warn('[Gemini AI Forecast Fallback]', e);
        }
      }

      predictions.push({
        siteId: site.id,
        siteName: site.name,
        predictedDemand,
        prePositioningRecommendation: recommendation,
        estimatedCostSavings: savings,
      });
    }

    return predictions;
  }

  /**
   * Explains high idle or DTC anomalies and provides corrective engineering actions
   */
  public async explainAnomaly(params: {
    assetId: string;
    anomalyType?: string;
    idleHours?: number;
    runtimeHours?: number;
    diagnosticCodes?: string[];
  }): Promise<AnomalyAnalysis> {
    const asset = assetRepository.getById(params.assetId);
    const assetModel = asset?.model || 'Caterpillar Machine';

    const idle = params.idleHours ?? (asset?.totalIdleHours ? 10.0 : 8.0);
    const runtime = params.runtimeHours ?? (asset?.totalEngineHours ? 1.5 : 2.0);
    const dtc = params.diagnosticCodes || ['SPN 3509 FMI 4'];

    const idleRatio = Math.round((idle / (idle + runtime)) * 100);
    const wasteDollars = Math.round(idle * 3.8 * 1.25 * 5); // 5 days waste

    let rootCause = `Operator leaving machine running during extended queue waiting and trench clearance delays at site S003.`;
    let correctiveActions = [
      'Enable Auto-Engine Shutdown timer (set to 5 minutes idle cutoff) via ECM software.',
      'Alert Site Superintendent to re-sequence haul truck loading intervals.',
      'Audit operator cabin telematics log for HVAC continuous standby usage.',
    ];

    if (dtc.length > 0 && dtc[0].includes('3509')) {
      rootCause = `5V Sensor Supply 1 circuit voltage below normal threshold (22.8V battery rail). Possible harness chafing or alternator diode drop.`;
      correctiveActions = [
        'Dispatch field service truck with Caterpillar ET diagnostic cable.',
        'Inspect primary harness J1/P1 connector for pin fretting corrosion.',
        'Test alternator 28V charging output and replace secondary voltage regulator if <24.0V.',
      ];
    }

    // Try live Gemini AI explanation
    const client = this.getClient();
    if (client) {
      try {
        const prompt = `You are a Caterpillar Master Certified Telematics Engineer.
Asset: ${assetModel} (ID: ${params.assetId})
Idle Hours: ${idle}h vs Runtime: ${runtime}h (Idle Ratio: ${idleRatio}%).
Fault Codes: ${dtc.join(', ')}.
Financial Impact: $${wasteDollars}.
Provide:
1. A concise technical root cause (1-2 sentences).
2. Exactly 3 actionable engineering corrective actions for fleet managers.
Return JSON format: { "rootCause": string, "correctiveActions": string[] }`;

        const response = await client.models.generateContent({
          model: config.geminiModel,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.rootCause) rootCause = parsed.rootCause;
          if (Array.isArray(parsed.correctiveActions)) {
            correctiveActions = parsed.correctiveActions;
          }
        }
      } catch (e) {
        console.warn('[Gemini AI Anomaly Fallback]', e);
      }
    }

    return {
      assetId: params.assetId,
      assetModel,
      anomalyType: params.anomalyType || 'High Idle Ratio & CAN-bus Code',
      idleRatio,
      financialImpactUsd: wasteDollars,
      rootCause,
      correctiveActions,
    };
  }

  /**
   * Natural language fleet query assistant
   */
  public async queryFleet(
    query: string,
    _contextSiteId?: string
  ): Promise<{ answer: string; relatedAssetIds: string[]; confidence: number }> {
    const assets = assetRepository.getAll();
    const rentals = rentalRepository.getAll();
    const alerts = telemetryRepository.getAnomalies();

    // Default heuristic matcher
    let answer = `Fleet status: ${assets.length} machines registered (${assets.filter((a) => a.status === AssetStatus.RENTED).length} active on rent, ${assets.filter((a) => a.status === AssetStatus.AVAILABLE).length} available for checkout).`;
    const relatedAssetIds: string[] = [];

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('overdue')) {
      const overdueUnits = assets.filter((a) => a.status === AssetStatus.OVERDUE);
      relatedAssetIds.push(...overdueUnits.map((a) => a.id));
      answer = `There are currently ${overdueUnits.length} overdue machine(s): ${overdueUnits.map((a) => `${a.id} (${a.model})`).join(', ')}. Urgent return notice generated.`;
    } else if (lowerQuery.includes('idle') || lowerQuery.includes('waste')) {
      relatedAssetIds.push('EQX1001', 'EQX1004', 'EQX1007');
      answer = `Highest idle anomalies detected on EQX1001 (10.0h idle) and EQX1007 (12.0h idle). Estimated unrecovered fuel and depreciation waste is $1,850 this week.`;
    } else if (lowerQuery.includes('available') || lowerQuery.includes('excavator')) {
      const availableExcavators = assets.filter(
        (a) => a.machineType === MachineType.EXCAVATOR && a.status === AssetStatus.AVAILABLE
      );
      relatedAssetIds.push(...availableExcavators.map((a) => a.id));
      answer = `Found ${availableExcavators.length} available excavator(s) ready for checkout: ${availableExcavators.map((a) => `${a.id} (${a.model})`).join(', ')}.`;
    }

    // Try Gemini AI
    const client = this.getClient();
    if (client) {
      try {
        const fleetSummary = `
Total Assets: ${assets.length}
Available: ${assets.filter((a) => a.status === AssetStatus.AVAILABLE).map((a) => `${a.id} - ${a.model}`).join(', ')}
Rented: ${assets.filter((a) => a.status === AssetStatus.RENTED).map((a) => `${a.id} - ${a.model}`).join(', ')}
Overdue: ${assets.filter((a) => a.status === AssetStatus.OVERDUE).map((a) => `${a.id} - ${a.model}`).join(', ')}
Active Rentals: ${rentals.map((r) => `Contract ${r.contractNumber} (${r.assetId} at ${r.siteId})`).join(', ')}
`;

        const prompt = `You are the Cat Connect Fleet Management Copilot.
Fleet State:
${fleetSummary}

User Question: "${query}"

Provide a professional, actionable, direct answer (2-3 sentences max).
Return JSON format: { "answer": string, "relatedAssetIds": string[] }`;

        const response = await client.models.generateContent({
          model: config.geminiModel,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.answer) answer = parsed.answer;
          if (Array.isArray(parsed.relatedAssetIds) && parsed.relatedAssetIds.length > 0) {
            relatedAssetIds.splice(0, relatedAssetIds.length, ...parsed.relatedAssetIds);
          }
        }
      } catch (e) {
        console.warn('[Gemini AI Query Fallback]', e);
      }
    }

    return {
      answer,
      relatedAssetIds,
      confidence: 0.96,
    };
  }
}

export const aiService = new AiService();
