import React from 'react';
import { LucideIcon, UserCheck, Layers, GitBranch } from 'lucide-react';
import { Card, CardContent } from './Card';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  moduleName: string;
  assignedMember: {
    number: number;
    name: string;
    focus: string;
  };
  plannedFeatures?: string[];
  suggestedFile?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  moduleName,
  assignedMember,
  plannedFeatures = [],
  suggestedFile,
  action,
}) => {
  return (
    <Card className="border-dashed border-slate-300 bg-white">
      <CardContent className="py-12 px-6 sm:px-12 text-center max-w-2xl mx-auto flex flex-col items-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
          <Icon className="w-7 h-7 stroke-[1.75]" />
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-lg">
          {description}
        </p>

        {/* Development Attribution Card */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left mb-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Assigned Developer</span>
            </div>
            <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100/60">
              Member {assignedMember.number}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <p className="text-slate-500">Lead Engineer</p>
              <p className="font-semibold text-slate-900 mt-0.5">{assignedMember.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Module Scope</p>
              <p className="font-semibold text-slate-900 mt-0.5">{assignedMember.focus}</p>
            </div>
          </div>

          {plannedFeatures.length > 0 && (
            <div className="border-t border-slate-200/60 pt-3">
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Planned Core Features</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {plannedFeatures.map((feat) => (
                  <span
                    key={feat}
                    className="text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestedFile && (
            <div className="border-t border-slate-200/60 pt-2.5 mt-3 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                Target file
              </span>
              <code className="text-slate-700 font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                {suggestedFile}
              </code>
            </div>
          )}
        </div>

        {/* Action Button slot */}
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
};
