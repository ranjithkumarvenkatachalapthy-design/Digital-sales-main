import React from 'react';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StockBadge, CategoryBadge } from '../ui/Badge';
import { useProducts } from '../../contexts/ProductContext';
import {
  Package,
  Barcode,
  TrendingUp,
  Boxes,
  Calendar,
  Clock,
  History,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  SlidersHorizontal,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onAdjustStock,
}) => {
  const { stockLogs } = useProducts();

  if (!product) return null;

  const productLogs = stockLogs
    .filter((log) => log.productId === product.id)
    .slice(0, 5);

  const profit = product.costPrice !== undefined ? product.price - product.costPrice : null;
  const marginPercentage =
    profit !== null && product.costPrice ? ((profit / product.price) * 100).toFixed(1) : null;
  const totalValue = product.price * product.quantity;

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{product.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                {product.sku}
              </span>
              <CategoryBadge category={product.category} />
              <StockBadge status={product.status} quantity={product.quantity} />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {onAdjustStock && (
              <Button
                variant="outline"
                size="sm"
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onAdjustStock(product);
                }}
              >
                Adjust Stock
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
              >
                Edit Product
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Selling Price */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Selling Price
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-slate-500">per {product.unit || 'unit'}</span>
          </div>

          {/* Cost Price & Margin */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Cost Price
            </p>
            <p className="text-lg font-bold text-slate-700 mt-1">
              {product.costPrice !== undefined
                ? `₹${product.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '—'}
            </p>
            {marginPercentage ? (
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {marginPercentage}% margin
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Not configured</span>
            )}
          </div>

          {/* Current Stock */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Current Stock
            </p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {product.quantity} <span className="text-xs font-normal text-slate-500">{product.unit || 'pcs'}</span>
            </p>
            <span className="text-[10px] text-slate-500">
              Threshold: ≤ {product.minStockLevel} {product.unit || 'pcs'}
            </span>
          </div>

          {/* Inventory Valuation */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3">
            <p className="text-[11px] font-medium text-indigo-700 uppercase tracking-wider">
              Inventory Value
            </p>
            <p className="text-lg font-bold text-indigo-950 mt-1">
              ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] text-indigo-600">{product.quantity} × ₹{product.price}</span>
          </div>
        </div>

        {/* Product Information Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Product Specifications
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">SKU Code:</span>
              <span className="font-mono font-semibold text-slate-800">{product.sku}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{product.category}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Barcode / EAN:</span>
              <span className="font-mono text-slate-800">{product.barcode || '— None —'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Unit of Measure:</span>
              <span className="capitalize text-slate-800">{product.unit || 'Pieces (pcs)'}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Added on:</span>
              <span className="text-slate-800">{formatDate(product.createdAt)}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Last updated:</span>
              <span className="text-slate-800">{formatDate(product.updatedAt)}</span>
            </div>
          </div>

          {product.description && (
            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-1">Description:</p>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Recent Stock Movement History */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Stock Activity
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              {productLogs.length} logged record(s)
            </span>
          </div>

          {productLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              No recent stock audit logs for this item yet.
            </p>
          ) : (
            <div className="space-y-2">
              {productLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${log.quantityChanged > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                        }`}
                    >
                      {log.quantityChanged > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {log.changeType}: <span className="text-slate-600 font-normal">{log.reason || 'Manual update'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(log.timestamp)} • by {log.performedBy || 'System'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-bold font-mono ${log.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                    >
                      {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Qty: {log.previousQuantity} → {log.newQuantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
