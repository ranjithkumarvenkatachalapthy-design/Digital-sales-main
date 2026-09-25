import React from 'react';
import { Receipt } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { EmptyState } from '../components/ui/EmptyState';

export const Sales: React.FC = () => {
  return (
    <PageContainer
      subtitle="Point-of-Sale billing counter, cart management, instant receipt generation, and payment processing."
    >
      <EmptyState
        icon={Receipt}
        title="Sales & Billing Terminal"
        description="The active billing screen and POS counter will appear here. It will enable adding products to an active cart, applying discounts/taxes, selecting payment modes, and generating digital bills."
        moduleName="Sales & Billing"
        assignedMember={{
          number: 3,
          name: 'Prithvi',
          focus: 'Sales, Billing, History & Digital Bills',
        }}
        plannedFeatures={[
          'Item Search & Barcode Quick-Add',
          'Live Cart Total & Tax Calculation',
          'Cash / Card / UPI Payment Toggle',
          'Digital Bill Print & WhatsApp/Email Share',
          'Customer Details & Phone Capture',
        ]}
        suggestedFile="src/pages/Sales.tsx"
      />
    </PageContainer>
  );
};
