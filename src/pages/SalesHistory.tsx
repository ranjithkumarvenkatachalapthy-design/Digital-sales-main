import React from 'react';
import { History } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';

export const SalesHistory: React.FC = () => {
  return (
    <PageContainer
      subtitle="Complete chronological transaction log, invoice reprint archive, and customer bill search."
    >
      <EmptyState
        icon={History}
        title="Sales History & Find My Bill"
        description="The historical invoices archive and search engine will appear here. Cashiers and admins can locate past bills by invoice number, customer phone number, or date range, and issue digital reprints."
        moduleName="Sales History & Lookup"
        assignedMember={{
          number: 3,
          name: 'Prithvi',
          focus: 'Sales, Billing, History & Digital Bills',
        }}
        plannedFeatures={[
          'Find My Bill (Search by Bill # or Mobile)',
          'Date Range & Payment Mode Filter',
          'Detailed Invoice Breakdown Modal',
          'Reprint & Export Invoice PDF',
          'Refund & Cancellation Records',
        ]}
        suggestedFile="src/pages/SalesHistory.tsx"
      />
    </PageContainer>
  );
};
