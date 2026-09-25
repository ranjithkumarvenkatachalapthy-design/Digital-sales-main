import React from 'react';
import { LayoutDashboard, Sparkles, BarChart2 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  return (
    <PageContainer
      subtitle="Executive summary, operational metrics, and fast-action shortcuts."
    >
      {/* Primary Placeholder Empty State */}
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard"
        description="Your business overview will appear here. This module will integrate live revenue charts, real-time sales numbers, fast billing shortcuts, and inventory stock warnings."
        moduleName="Executive Dashboard"
        assignedMember={{
          number: 4,
          name: 'Keerthana',
          focus: 'Dashboard, Analytics & System Integration',
        }}
        plannedFeatures={[
          'Today\'s Sales Overview',
          'Revenue & Margin Analytics',
          'Low-Stock Alert Banners',
          'Recent Bill Quick-Lookup',
          'Top Selling Items List',
        ]}
        suggestedFile="src/pages/Dashboard.tsx"
      />

      {/* Architecture Readiness Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <CardTitle>Member 4 Integration Notes</CardTitle>
            </div>
            <CardDescription>
              Guidelines for implementing dashboard widgets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600">
            <p>
              • <strong>State:</strong> Connect to Supabase queries in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">src/lib/supabase.ts</code> for aggregating sales and stock data.
            </p>
            <p>
              • <strong>Reusability:</strong> Use existing components in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">src/components/ui/</code> (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Card</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">Button</code>).
            </p>
            <p>
              • <strong>No fake data:</strong> Fetch directly from your live database tables when ready.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <CardTitle>System Baseline</CardTitle>
            </div>
            <CardDescription>
              Foundation provided by Member 1
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Routing & Navigation</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Auth & Session Context</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Supabase Connection Wrapper</span>
              <span className="font-semibold text-indigo-600">Prepared</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
