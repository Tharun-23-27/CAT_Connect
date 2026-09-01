import { Router } from 'express';
import assetRoutes from './asset.routes.ts';
import rentalRoutes from './rental.routes.ts';
import telemetryRoutes from './telemetry.routes.ts';
import alertRoutes from './alert.routes.ts';
import aiRoutes from './ai.routes.ts';
import siteRoutes from './site.routes.ts';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'CAT Connect Telematics & Fleet API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    canBusGateway: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// API Documentation / Endpoint Index
router.get('/docs', (_req, res) => {
  res.json({
    version: 'v1',
    endpoints: [
      { path: '/api/v1/health', method: 'GET', description: 'System health check' },
      { path: '/api/v1/assets/overview', method: 'GET', description: 'Fleet KPIs & financial metrics' },
      { path: '/api/v1/assets', method: 'GET', description: 'Filterable list of fleet assets' },
      { path: '/api/v1/assets/:id', method: 'GET', description: 'Get specific asset details' },
      { path: '/api/v1/assets/:id/status', method: 'PATCH', description: 'Update asset status' },
      { path: '/api/v1/assets/telematics/live', method: 'GET', description: 'Live GPS & CAN-bus stream' },
      { path: '/api/v1/rentals/active', method: 'GET', description: 'List ongoing active rentals' },
      { path: '/api/v1/rentals/checkout', method: 'POST', description: 'Dispatch asset to site' },
      { path: '/api/v1/rentals/checkin', method: 'POST', description: 'Check-in asset and calculate billing' },
      { path: '/api/v1/rentals/verify-qr', method: 'POST', description: 'Verify QR/RFID code' },
      { path: '/api/v1/telemetry/log', method: 'POST', description: 'Ingest daily/hourly telemetry log' },
      { path: '/api/v1/telemetry/summary', method: 'GET', description: 'Fleet utilization & idle summary' },
      { path: '/api/v1/telemetry/asset/:assetId', method: 'GET', description: 'Historical telemetry for asset' },
      { path: '/api/v1/alerts', method: 'GET', description: 'Operational alerts list' },
      { path: '/api/v1/alerts/run-detection', method: 'POST', description: 'Trigger rules engine detection cycle' },
      { path: '/api/v1/alerts/:id/resolve', method: 'PATCH', description: 'Resolve alert with notes' },
      { path: '/api/v1/ai/demand-forecast', method: 'POST', description: 'Gemini AI site demand prediction' },
      { path: '/api/v1/ai/explain-anomaly', method: 'POST', description: 'Gemini AI anomaly root-cause diagnosis' },
      { path: '/api/v1/ai/fleet-query', method: 'POST', description: 'Natural language fleet assistant' },
      { path: '/api/v1/sites', method: 'GET', description: 'List job sites' },
      { path: '/api/v1/operators', method: 'GET', description: 'List equipment operators' },
    ],
  });
});

// Mount Sub-routers
router.use('/assets', assetRoutes);
router.use('/rentals', rentalRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/alerts', alertRoutes);
router.use('/ai', aiRoutes);
router.use('/', siteRoutes);

export default router;
