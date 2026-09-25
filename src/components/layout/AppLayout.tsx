import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface PageMetadata {
  title: string;
  description: string;
}

const routeMetadataMap: Record<string, PageMetadata> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Executive overview of retail inventory, daily sales, and operational alerts.',
  },
  '/products': {
    title: 'Products Management',
    description: 'Master catalog of items, SKU classifications, unit pricing, and suppliers.',
  },
  '/inventory': {
    title: 'Inventory & Stock Control',
    description: 'Real-time stock tracking, minimum stock thresholds, and stock replenishment logs.',
  },
  '/sales': {
    title: 'Sales & Billing POS',
    description: 'Terminal for generating customer invoices, tax calculation, and digital receipts.',
  },
  '/sales-history': {
    title: 'Sales History & Bill Lookup',
    description: 'Archive of past customer invoices, payment method logs, and reprint engine.',
  },
  '/reports': {
    title: 'Reports & Analytics',
    description: 'Comprehensive sales analytics, revenue breakdowns, and tax export statements.',
  },
  '/settings': {
    title: 'System Settings',
    description: 'Store parameters, team assignments, and Supabase database configuration.',
  },
};

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const currentMeta = routeMetadataMap[location.pathname] || {
    title: 'DigitalSales',
    description: 'Digital Inventory, Billing and Sales Management System',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content container with desktop sidebar margin */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-200">
        <Header
          title={currentMeta.title}
          description={currentMeta.description}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
