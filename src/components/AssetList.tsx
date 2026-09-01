import React, { useState } from 'react';
import { Asset, AssetStatus, MachineType, Site } from '../backend/models/index.ts';
import {
  Search,
  Filter,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Fuel,
  Gauge,
  Zap,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  sites: Site[];
  loading: boolean;
  onSelectCheckOut: (asset: Asset) => void;
  onSelectCheckIn: (asset: Asset) => void;
  onQuickQrScan: (asset: Asset) => void;
  onFilterChange: (filters: { status?: AssetStatus; machineType?: MachineType; search?: string }) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  sites,
  loading,
  onSelectCheckOut,
  onSelectCheckIn,
  onQuickQrScan,
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onFilterChange({
      search: val || undefined,
      status: selectedStatus !== 'ALL' ? (selectedStatus as AssetStatus) : undefined,
      machineType: selectedType !== 'ALL' ? (selectedType as MachineType) : undefined,
    });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStatus(val);
    onFilterChange({
      search: searchTerm || undefined,
      status: val !== 'ALL' ? (val as AssetStatus) : undefined,
      machineType: selectedType !== 'ALL' ? (selectedType as MachineType) : undefined,
    });
  };

  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedType(val);
    onFilterChange({
      search: searchTerm || undefined,
      status: selectedStatus !== 'ALL' ? (selectedStatus as AssetStatus) : undefined,
      machineType: val !== 'ALL' ? (val as MachineType) : undefined,
    });
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            ● AVAILABLE
          </span>
        );
      case AssetStatus.RENTED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800/60">
            ● ON RENT
          </span>
        );
      case AssetStatus.OVERDUE:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-800/80 animate-pulse">
            ▲ OVERDUE
          </span>
        );
      case AssetStatus.MAINTENANCE:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800/60">
            ■ SERVICE BAY
          </span>
        );
      case AssetStatus.IN_TRANSIT:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-400 border border-purple-800/60">
            ► IN TRANSIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const getSiteName = (siteId: string | null) => {
    if (!siteId) return 'Main Yard / Depot (Austin)';
    const site = sites.find((s) => s.id === siteId);
    return site ? `${site.name} (${siteId})` : siteId;
  };

  return (
    <div id="fleet-asset-directory" className="space-y-4">
      {/* Controls: Search, Filter, Dispatch Ready */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-asset-search"
            type="text"
            placeholder="Search Model, EQX ID, Serial..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filter Status */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value={AssetStatus.AVAILABLE}>Available (Ready)</option>
              <option value={AssetStatus.RENTED}>On Rent (Active)</option>
              <option value={AssetStatus.OVERDUE}>Overdue Return</option>
              <option value={AssetStatus.MAINTENANCE}>Maintenance</option>
              <option value={AssetStatus.IN_TRANSIT}>In Transit</option>
            </select>
          </div>

          {/* Filter Machine Type */}
          <select
            id="select-filter-type"
            value={selectedType}
            onChange={handleTypeFilter}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Machine Types</option>
            <option value={MachineType.EXCAVATOR}>Excavators</option>
            <option value={MachineType.DOZER}>Track Dozers</option>
            <option value={MachineType.WHEEL_LOADER}>Wheel Loaders</option>
            <option value={MachineType.MOTOR_GRADER}>Motor Graders</option>
            <option value={MachineType.SKID_STEER}>Skid Steers</option>
            <option value={MachineType.CRANE}>Cranes</option>
          </select>
        </div>
      </div>

      {/* Asset Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-900/60 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No matching assets found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Machine & Serial</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location / Job Site</th>
                  <th className="px-4 py-3">CAN-Bus Live Stream</th>
                  <th className="px-4 py-3">Health & Rate</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {assets.map((asset) => {
                  const isAvailable = asset.status === AssetStatus.AVAILABLE;
                  const isRented =
                    asset.status === AssetStatus.RENTED ||
                    asset.status === AssetStatus.OVERDUE;

                  return (
                    <tr
                      key={asset.id}
                      id={`asset-row-${asset.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Machine & Serial */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                            {asset.id.slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center space-x-2">
                              <span>{asset.model}</span>
                              <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {asset.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              SN: {asset.serialNumber} • {asset.machineType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(asset.status)}
                      </td>

                      {/* 3. Location / Job Site */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start space-x-1.5 text-xs text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-200">
                              {getSiteName(asset.currentSiteId)}
                            </p>
                            {asset.assignedOperatorId && (
                              <p className="text-xs text-slate-400">
                                Op: {asset.assignedOperatorId}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Live CAN-Bus Gauges */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-4 text-xs">
                          {/* Engine RPM & Hours */}
                          <div className="flex items-center space-x-1" title="Engine Runtime">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-slate-200">
                              {asset.telemetryLive.engineHours.toFixed(1)}h
                            </span>
                          </div>

                          {/* Fuel Level */}
                          <div className="flex items-center space-x-1" title="Fuel Tank Level">
                            <Fuel className="w-3.5 h-3.5 text-amber-400" />
                            <span
                              className={`font-mono font-medium ${
                                asset.fuelLevelPercent < 30
                                  ? 'text-red-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {asset.fuelLevelPercent}%
                            </span>
                          </div>

                          {/* Battery Voltage */}
                          <div className="flex items-center space-x-1" title="Battery ECM Voltage">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span
                              className={`font-mono ${
                                asset.telemetryLive.batteryVoltage < 23
                                  ? 'text-red-400 font-bold'
                                  : 'text-slate-300'
                              }`}
                            >
                              {asset.telemetryLive.batteryVoltage.toFixed(1)}V
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Health & Rate */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white">
                              ${asset.dayRateUsd}
                            </span>
                            <span className="text-slate-400">/day</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-slate-400">Health:</span>
                            <span
                              className={`font-semibold ${
                                asset.healthIndex >= 85
                                  ? 'text-emerald-400'
                                  : asset.healthIndex >= 70
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {asset.healthIndex}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            id={`btn-qr-scan-${asset.id}`}
                            onClick={() => onQuickQrScan(asset)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition"
                            title={`Scan QR/RFID for ${asset.id}`}
                          >
                            <QrCode className="w-4 h-4 text-amber-400" />
                          </button>

                          {isAvailable && (
                            <button
                              id={`btn-checkout-${asset.id}`}
                              onClick={() => onSelectCheckOut(asset)}
                              className="inline-flex items-center space-x-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold px-2.5 py-1.5 rounded transition shadow-sm"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {isRented && (
                            <button
                              id={`btn-checkin-${asset.id}`}
                              onClick={() => onSelectCheckIn(asset)}
                              className="inline-flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition shadow-sm"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
