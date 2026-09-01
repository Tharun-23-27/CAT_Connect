import React from 'react';
import { FleetOverview } from '../backend/models/index.ts';
import {
  Truck,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  TrendingUp,
  HeartPulse,
} from 'lucide-react';

interface FleetOverviewCardProps {
  overview: FleetOverview | null;
  loading: boolean;
}

export const FleetOverviewCard: React.FC<FleetOverviewCardProps> = ({
  overview,
  loading,
}) => {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/60 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div id="fleet-overview-metrics" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Fleet Utilization */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Utilization
          </span>
          <TrendingUp className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {overview.utilizationPercentage}%
          </span>
          <span className="text-xs text-slate-400">
            {overview.rented + overview.overdue}/{overview.totalUnits} active
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${overview.utilizationPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Available Units */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Ready
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            {overview.available}
          </span>
          <span className="text-xs text-slate-400">machines in yard</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Ready for instant dispatch</p>
      </div>

      {/* 3. Overdue Units */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overdue Returns
          </span>
          <Clock className="w-4 h-4 text-red-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              overview.overdue > 0 ? 'text-red-400' : 'text-slate-300'
            }`}
          >
            {overview.overdue}
          </span>
          <span className="text-xs text-slate-400">past return date</span>
        </div>
        <p className="mt-1 text-xs text-red-400/80 font-medium">
          {overview.overdue > 0 ? 'Penalty fees accruing' : 'Zero contract breaches'}
        </p>
      </div>

      {/* 4. Average Health Index */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fleet Health
          </span>
          <HeartPulse className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-cyan-400 tracking-tight">
            {overview.averageHealthIndex}
            <span className="text-sm font-normal text-slate-500">/100</span>
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${overview.averageHealthIndex}%` }}
          />
        </div>
      </div>

      {/* 5. Service & Transit */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Maintenance & Transit
          </span>
          <Wrench className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {overview.service + overview.transit}
          </span>
          <span className="text-xs text-slate-400">
            ({overview.service} bay / {overview.transit} road)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Scheduled PM & haulage</p>
      </div>

      {/* 6. Active Monthly Revenue */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Run-Rate
          </span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            ${(overview.activeMonthlyRevenueUsd / 1000).toFixed(1)}k
          </span>
          <span className="text-xs text-slate-400">/mo</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 font-mono">
          Target: ${(overview.projectedMonthlyRevenueUsd / 1000).toFixed(1)}k/mo
        </p>
      </div>
    </div>
  );
};
