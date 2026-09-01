import React, { useState } from 'react';
import { Asset, Site, Operator } from '../backend/models/index.ts';
import { X, ArrowUpRight, Calendar, User, MapPin, DollarSign } from 'lucide-react';

interface CheckOutModalProps {
  asset: Asset | null;
  sites: Site[];
  operators: Operator[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  asset,
  sites,
  operators,
  onClose,
  onSubmit,
}) => {
  if (!asset) return null;

  const [siteId, setSiteId] = useState(sites[0]?.id || 'S001');
  const [customerName, setCustomerName] = useState('Austin InfraBuild Consortium');
  const [operatorId, setOperatorId] = useState(operators[0]?.id || 'OP-101');
  const [expectedCheckInDate, setExpectedCheckInDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        assetId: asset.id,
        siteId,
        customerName,
        operatorId,
        expectedCheckInDate,
        initialEngineHours: asset.totalEngineHours,
        initialFuelPercent: asset.fuelLevelPercent,
        dayRateUsd: asset.dayRateUsd,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-checkout-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-checkout-content"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Dispatch Equipment ({asset.id})
            </h2>
            <p className="text-xs text-slate-400">{asset.model}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Destination Job Site */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Target Job Site</span>
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) - {s.customer}
                </option>
              ))}
            </select>
          </div>

          {/* Customer / Contracting Entity */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Customer / General Contractor
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Certified Operator */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Assigned Certified Operator</span>
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.id}) - Exp: {op.experienceYears} yrs
                </option>
              ))}
            </select>
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Scheduled Return Date (Contract End)</span>
            </label>
            <input
              type="date"
              required
              value={expectedCheckInDate}
              onChange={(e) => setExpectedCheckInDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Baseline Telemetry Verification */}
          <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-slate-400">Current Hours</div>
              <div className="text-white font-mono font-bold">
                {asset.totalEngineHours.toFixed(1)}h
              </div>
            </div>
            <div>
              <div className="text-slate-400">Fuel Tank</div>
              <div className="text-emerald-400 font-mono font-bold">
                {asset.fuelLevelPercent}%
              </div>
            </div>
            <div>
              <div className="text-slate-400">Daily Day Rate</div>
              <div className="text-amber-400 font-mono font-bold">
                ${asset.dayRateUsd}/day
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Dispatch & Geofence Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Standard 500m geofence radius active. Auto-idle shutdown verified."
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition shadow-sm"
            >
              {isSubmitting ? 'Generating Contract...' : 'Confirm Dispatch & Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
