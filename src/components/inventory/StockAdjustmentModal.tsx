import React, { useState, useEffect } from 'react';
import { Product, StockChangeType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StockBadge } from '../ui/Badge';
import { useProducts } from '../../contexts/ProductContext';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  AlertCircle,
  Plus,
  Minus,
  Check,
} from 'lucide-react';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'restock' | 'stock_out' | 'audit';
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  defaultMode = 'restock',
}) => {
  const { adjustStock, updateProduct } = useProducts();

  const [mode, setMode] = useState<'restock' | 'stock_out' | 'audit'>(defaultMode);
  const [quantityInput, setQuantityInput] = useState('10');
  const [reason, setReason] = useState('Supplier shipment received');
  const [customReason, setCustomReason] = useState('');
  const [thresholdInput, setThresholdInput] = useState('');
  const [updateThreshold, setUpdateThreshold] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setMode(defaultMode);
      setQuantityInput(defaultMode === 'restock' ? '10' : '1');
      setReason(
        defaultMode === 'restock'
          ? 'Supplier shipment received'
          : defaultMode === 'stock_out'
            ? 'Damaged or expired goods'
            : 'Physical inventory audit'
      );
      setCustomReason('');
      setThresholdInput(String(product.minStockLevel || 5));
      setUpdateThreshold(false);
      setError(null);
    }
  }, [isOpen, product, defaultMode]);

  if (!product) return null;

  const currentQty = product.quantity;
  const qtyNumber = Math.max(0, parseInt(quantityInput, 10) || 0);

  let calculatedNewQty = currentQty;
  let calculatedDelta = 0;
  let changeType: StockChangeType = 'restock';

  if (mode === 'restock') {
    calculatedDelta = qtyNumber;
    calculatedNewQty = currentQty + qtyNumber;
    changeType = 'restock';
  } else if (mode === 'stock_out') {
    calculatedDelta = -Math.min(currentQty, qtyNumber);
    calculatedNewQty = Math.max(0, currentQty - qtyNumber);
    changeType = reason.toLowerCase().includes('damage') ? 'damage' : 'adjustment';
  } else {
    calculatedDelta = qtyNumber - currentQty;
    calculatedNewQty = qtyNumber;
    changeType = 'adjustment';
  }

  const resultingStatus =
    calculatedNewQty <= 0
      ? 'out_of_stock'
      : calculatedNewQty <= (updateThreshold ? parseInt(thresholdInput, 10) || 5 : product.minStockLevel)
        ? 'low_stock'
        : 'in_stock';

  const reasonPresets: Record<string, string[]> = {
    restock: [
      'Supplier shipment received',
      'Warehouse transfer in',
      'Customer return',
      'Stock replenish from bulk',
    ],
    stock_out: [
      'Damaged or expired goods',
      'Display sample / showroom use',
      'Theft / inventory shrinkage',
      'Warehouse transfer out',
    ],
    audit: [
      'Physical stock take correction',
      'System sync audit',
      'Cycle count reconciliation',
    ],
  };

  const handleQuickAdd = (amount: number) => {
    if (mode === 'audit') {
      setQuantityInput(String(Math.max(0, currentQty + amount)));
    } else {
      setQuantityInput(String(Math.max(1, qtyNumber + amount)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode !== 'audit' && qtyNumber <= 0) {
      setError('Please enter a quantity greater than 0.');
      return;
    }

    if (mode === 'audit' && isNaN(qtyNumber)) {
      setError('Please enter a valid audit quantity.');
      return;
    }

    const finalReason = customReason.trim() || reason;

    setIsSubmitting(true);
    try {
      if (calculatedDelta !== 0) {
        const result = await adjustStock(product.id, calculatedDelta, changeType, finalReason);
        if (!result.success) {
          setError(result.error || 'Failed to adjust stock.');
          setIsSubmitting(false);
          return;
        }
      }

      if (updateThreshold && thresholdInput !== '') {
        const newThreshold = Math.max(0, parseInt(thresholdInput, 10) || 5);
        if (newThreshold !== product.minStockLevel) {
          await updateProduct(product.id, { minStockLevel: newThreshold });
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply adjustment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <span>Adjust Stock Level</span>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {product.name} ({product.sku})
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="stock-adjust-form"
            isLoading={isSubmitting}
          >
            Confirm Adjustment
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form id="stock-adjust-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Adjustment Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Adjustment Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('restock');
                setReason(reasonPresets.restock[0]);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${mode === 'restock'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <ArrowUpRight className={`w-4 h-4 ${mode === 'restock' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Stock In (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('stock_out');
                setReason(reasonPresets.stock_out[0]);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${mode === 'stock_out'
                  ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <ArrowDownRight className={`w-4 h-4 ${mode === 'stock_out' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>Stock Out (-)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('audit');
                setReason(reasonPresets.audit[0]);
                setQuantityInput(String(currentQty));
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${mode === 'audit'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              <RotateCcw className={`w-4 h-4 ${mode === 'audit' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Set Count (=)</span>
            </button>
          </div>
        </div>

        {/* Quantity Input & Quick Increment Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {mode === 'restock'
                ? 'Quantity to Add'
                : mode === 'stock_out'
                  ? 'Quantity to Deduct'
                  : 'Exact Counted Quantity'}
            </label>
            <span className="text-xs text-slate-500">Unit: {product.unit || 'pcs'}</span>
          </div>

          <Input
            type="number"
            min="0"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            required
            autoFocus
          />

          {/* Quick Increment Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 mr-1">Quick:</span>
            {[+5, +10, +25, +50, +100].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors cursor-pointer font-medium"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Current</span>
              <p className="font-bold text-sm text-slate-800">{currentQty}</p>
            </div>

            <div className="text-slate-400 text-sm font-bold">
              {mode === 'restock' ? '+' : mode === 'stock_out' ? '−' : '→'}
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Change</span>
              <p
                className={`font-bold text-sm ${calculatedDelta > 0
                    ? 'text-emerald-600'
                    : calculatedDelta < 0
                      ? 'text-rose-600'
                      : 'text-slate-600'
                  }`}
              >
                {calculatedDelta > 0 ? `+${calculatedDelta}` : calculatedDelta}
              </p>
            </div>

            <div className="text-slate-400 text-sm font-bold">=</div>

            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">New Total</span>
              <p className="font-bold text-base text-indigo-900">{calculatedNewQty}</p>
            </div>

            <div>
              <StockBadge status={resultingStatus} quantity={calculatedNewQty} />
            </div>
          </div>
        </div>

        {/* Reason Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Adjustment
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors mb-2"
          >
            {(reasonPresets[mode] || []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="custom">Other / Custom reason...</option>
          </select>

          {reason === 'custom' && (
            <input
              type="text"
              placeholder="Specify custom reason or note..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              autoFocus
            />
          )}
        </div>

        {/* Optional: Update Low Stock Threshold */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={updateThreshold}
              onChange={(e) => setUpdateThreshold(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 font-medium">
              Also modify low-stock alert threshold (Currently: {product.minStockLevel})
            </span>
          </label>

          {updateThreshold && (
            <div className="mt-2.5 max-w-xs">
              <Input
                label="New Alert Threshold Level"
                type="number"
                min="0"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                helperText="Triggers low stock alert when quantity drops to this value"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
