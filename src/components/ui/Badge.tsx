import React from 'react';
import { StockStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface StockBadgeProps {
  status: StockStatus;
  quantity?: number;
  className?: string;
  showIcon?: boolean;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  status,
  quantity,
  className = '',
  showIcon = true,
}) => {
  if (status === 'out_of_stock' || quantity === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
      >
        {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
        <span>Out of Stock</span>
      </span>
    );
  }

  if (status === 'low_stock') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
      >
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
        <span>Low Stock</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
    >
      {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      <span>In Stock</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string; className?: string }> = ({
  category,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 ${className}`}
    >
      {category}
    </span>
  );
};
