import React, { useState } from 'react';
import { Asset } from '../backend/models/index.ts';
import { X, ArrowDownLeft, Fuel, Gauge, AlertTriangle, FileText } from 'lucide-react';

interface CheckInModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  asset,
  onClose,
  onSubmit,
}) => {
  if (!asset) return null;

  const [returnEngineHours, setReturnEngineHours] = useState(
    Math.round((asset.totalEngineHours + 24.5) * 10) / 10
  );
  const [returnFuelPercent, setReturnFuelPercent] = useState(
    Math.max(20, asset.fuelLevelPercent - 15)
  );
  const [conditionNotes, setConditionNotes] = useState('Normal bucket wear, grease points serviced.');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageRepairFeeUsd, setDamageRepairFeeUsd] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceSummary, setInvoiceSummary] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        assetId: asset.id,
        returnEngineHours: Number(returnEngineHours),
        returnFuelPercent: Number(returnFuelPercent),
        conditionNotes,
        isDamaged,
        damageRepairFeeUsd: isDamaged ? Number(damageRepairFeeUsd) : 0,
      });
      setInvoiceSummary(result.billingSummary);
    } catch (err: any) {
      setError(err.message || 'Failed to process return');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-checkin-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="modal-checkin-content"
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Machine Check-In & Final Audit ({asset.id})
            </h2>
            <p className="text-xs text-slate-400">{asset.model}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded">
            {error}
          </div>
        )}

        {invoiceSummary ? (
          /* Billing & Closeout Invoice Confirmation */
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
                <FileText className="w-4 h-4" />
                <span>Return Processed & Machine Available</span>
              </div>
              <p className="text-slate-300">
                Contract <span className="font-mono text-white">{invoiceSummary.contractNumber}</span> closed for{' '}
                <span className="font-medium text-white">{invoiceSummary.customerName}</span>.
              </p>
            </div>

            <div className="bg-slate-800/70 rounded-lg p-4 space-y-2 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Duration ({invoiceSummary.daysRented} days @ ${asset.dayRateUsd}/day):</span>
                <span className="text-white">${invoiceSummary.baseRentalCostUsd.toLocaleString()}</span>
              </div>

              {invoiceSummary.overduePenaltyUsd > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Overdue Penalty ({invoiceSummary.overdueDays} days):</span>
                  <span>+${invoiceSummary.overduePenaltyUsd.toLocaleString()}</span>
                </div>
              )}

              {invoiceSummary.fuelChargeUsd > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Fuel Refill ({invoiceSummary.fuelDeficitPercent}% missing @ $3.50/%):</span>
                  <span>+${invoiceSummary.fuelChargeUsd.toLocaleString()}</span>
                </div>
              )}

              {invoiceSummary.damageFeeUsd > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Damage / Repair Assessment:</span>
                  <span>+${invoiceSummary.damageFeeUsd.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold text-emerald-400">
                <span>Total Invoice Billed:</span>
                <span>${invoiceSummary.totalCostUsd.toLocaleString()} USD</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition"
              >
                Close & Return to Fleet
              </button>
            </div>
          </div>
        ) : (
          /* Check-In Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {/* Return Hours */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>Return ECM Engine Hours</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={asset.totalEngineHours}
                  required
                  value={returnEngineHours}
                  onChange={(e) => setReturnEngineHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-slate-500 text-[10px] mt-0.5 block">
                  Checkout hours: {asset.totalEngineHours.toFixed(1)}h
                </span>
              </div>

              {/* Return Fuel Level */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-400" />
                  <span>Return Fuel Tank Level (%)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={returnFuelPercent}
                  onChange={(e) => setReturnFuelPercent(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="text-slate-500 text-[10px] mt-0.5 block">
                  Checkout level: {asset.fuelLevelPercent}%
                </span>
              </div>
            </div>

            {/* Condition Notes */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Post-Rental Physical Inspection Notes
              </label>
              <textarea
                rows={2}
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Damage Checkbox */}
            <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDamaged}
                  onChange={(e) => setIsDamaged(e.target.checked)}
                  className="rounded bg-slate-800 text-amber-500 focus:ring-amber-500 border-slate-600"
                />
                <span className="text-slate-200 font-medium flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flag for Service Bay Inspection / Damage Surcharge</span>
                </span>
              </label>

              {isDamaged && (
                <div className="pt-2">
                  <label className="block text-slate-400 mb-1">Estimated Repair Fee ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={damageRepairFeeUsd}
                    onChange={(e) => setDamageRepairFeeUsd(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition shadow-sm"
              >
                {isSubmitting ? 'Calculating Billing...' : 'Audit Machine & Compute Invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
