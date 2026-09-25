import React from 'react';
import { BarChart3 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';

export const Reports: React.FC = () => {
  return (
    <PageContainer
      subtitle="Periodic revenue summaries, profit & loss estimates, inventory valuation, and GST reports."
    >
      <EmptyState
        icon={BarChart3}
        title="Reports & Analytics"
        description="The business intelligence, accounting reports, and tax export engine will appear here. It will generate downloadable sales summaries, top-selling product reports, and tax compliance data."
        moduleName="Reports & Analytics"
        assignedMember={{
          number: 4,
          name: 'Keerthana',
          focus: 'Dashboard, Reports, Charts & Final Integration',
        }}
        plannedFeatures={[
          'Daily / Weekly / Monthly Sales Summaries',
          'Profit & Margin Analysis Reports',
          'Inventory Valuation & Depreciation',
          'GST / Tax Breakdown Sheets',
          'Export to Excel & PDF',
        ]}
        suggestedFile="src/pages/Reports.tsx"
      />
    </PageContainer>
  );
};
