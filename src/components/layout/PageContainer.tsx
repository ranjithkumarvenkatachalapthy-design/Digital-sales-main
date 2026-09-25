import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  subtitle?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  actions,
  subtitle,
}) => {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${className}`}>
      {(subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          {subtitle && (
            <p className="text-sm text-slate-600 max-w-2xl">
              {subtitle}
            </p>
          )}
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
