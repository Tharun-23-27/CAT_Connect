import React, { useState } from 'react';
import { Asset, Site, AssetStatus } from '../backend/models/index.ts';
import { MapPin, Navigation, Radio, Shield, Crosshair, AlertTriangle } from 'lucide-react';

interface RadarMapProps {
  assets: Asset[];
  sites: Site[];
  onSelectAsset: (asset: Asset) => void;
}

export const RadarMap: React.FC<RadarMapProps> = ({ assets, sites, onSelectAsset }) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Approximate relative bounds for Texas Austin corridor
  // Lat: 30.15 - 30.50, Lng: -97.85 - -97.60
  const minLat = 30.15;
  const maxLat = 30.50;
  const minLng = -97.88;
  const maxLng = -97.62;

  const toPercentX = (lng: number) => {
    return Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
  };

  const toPercentY = (lat: number) => {
    // invert Y because latitude grows northwards
    return Math.max(5, Math.min(95, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
  };

  return (
    <div id="jobsite-radar-map" className="space-y-6">
      {/* Map Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Live Fleet GPS Radar & Geofence Boundaries
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS telematics overlay across active Texas quarries, expressway corridors, and logistics hubs.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Available</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-slate-300">On Rent</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400">Overdue / Anomaly</span>
          </span>
        </div>
      </div>

      {/* Radar Map Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg h-[540px] relative overflow-hidden p-6 shadow-inner flex flex-col justify-between">
        {/* Radar grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[450px] h-[450px] border border-amber-500/30 rounded-full" />
          <div className="w-[300px] h-[300px] border border-amber-500/40 rounded-full absolute" />
          <div className="w-[150px] h-[150px] border border-amber-500/50 rounded-full absolute" />
        </div>

        {/* Job Sites with Geofence Rings */}
        {sites.map((site) => {
          const posX = toPercentX(site.longitude);
          const posY = toPercentY(site.latitude);
          const isSelected = selectedSiteId === site.id;

          return (
            <div
              key={site.id}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            >
              {/* Geofence Ring */}
              <div
                className={`rounded-full absolute -inset-6 pointer-events-none transition-all ${
                  isSelected
                    ? 'border-2 border-amber-500 bg-amber-500/10'
                    : 'border border-blue-500/40 bg-blue-500/5 group-hover:border-amber-500/60'
                }`}
              />

              {/* Site Icon */}
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-500 text-amber-400 flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4" />
              </div>

              {/* Site Tooltip */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-slate-200 text-[11px] px-2.5 py-1.5 rounded shadow-xl whitespace-nowrap pointer-events-none">
                <span className="font-bold text-white block">{site.name}</span>
                <span className="text-slate-400">
                  {site.id} • {site.activeMachinesCount} units on-site
                </span>
              </div>
            </div>
          );
        })}

        {/* Machine GPS Pins */}
        {assets.map((asset) => {
          const lat = asset.telemetryLive?.lat || 30.2672;
          const lng = asset.telemetryLive?.lng || -97.7431;
          const posX = toPercentX(lng);
          const posY = toPercentY(lat);

          const isOverdue = asset.status === AssetStatus.OVERDUE;
          const isAvailable = asset.status === AssetStatus.AVAILABLE;
          const isRented = asset.status === AssetStatus.RENTED;

          return (
            <div
              key={asset.id}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              onClick={() => onSelectAsset(asset)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Pulse for overdue / anomalies */}
              {isOverdue && (
                <div className="w-6 h-6 rounded-full bg-red-500/30 animate-ping absolute -inset-1" />
              )}

              {/* Machine Icon Pin */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold shadow-md border ${
                  isOverdue
                    ? 'bg-red-600 text-white border-red-300'
                    : isAvailable
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : isRented
                    ? 'bg-blue-500 text-white border-blue-300'
                    : 'bg-slate-700 text-slate-200 border-slate-500'
                }`}
              >
                {asset.id.slice(-2)}
              </div>

              {/* Hover Badge */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] p-2 rounded shadow-2xl whitespace-nowrap z-30 pointer-events-none">
                <div className="font-bold text-white">{asset.model}</div>
                <div className="font-mono text-amber-400">{asset.id} • {asset.status}</div>
                <div className="text-slate-400">
                  {asset.telemetryLive.engineHours.toFixed(1)}h ECM • {asset.fuelLevelPercent}% Fuel
                </div>
              </div>
            </div>
          );
        })}

        {/* Radar Coordinates Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 border border-slate-800 rounded p-2.5 text-[11px] font-mono text-slate-400 z-10">
          <div>REGION: TEXAS CORRIDOR (AUSTIN-ROUND ROCK)</div>
          <div>DATUM: WGS84 • ECM GPS ACCURACY: &plusmn;1.2m</div>
        </div>
      </div>
    </div>
  );
};
