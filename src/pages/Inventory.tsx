import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StockBadge, CategoryBadge } from '../components/ui/Badge';
import { useProducts } from '../contexts/ProductContext';
import { Product, StockLog } from '../types';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';
import { ProductDetailsModal } from '../components/products/ProductDetailsModal';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  SlidersHorizontal,
  History,
  Download,
  Eye,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Tag,
  Clock,
  Layers,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const { products, stockLogs, stats, adjustStock } = useProducts();

  // Active tab & view
  const [activeTab, setActiveTab] = useState<'matrix' | 'logs'>('matrix');
  const [filterView, setFilterView] = useState<'all' | 'low_and_out' | 'out_of_stock' | 'in_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [adjustDefaultMode, setAdjustDefaultMode] = useState<'restock' | 'stock_out' | 'audit'>('restock');
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);

  // Quick 1-click restock handler
  const handleQuickRestock = async (product: Product, quantityToAdd: number) => {
    await adjustStock(
      product.id,
      quantityToAdd,
      'restock',
      `Quick 1-Click Restock (+${quantityToAdd} units)`
    );
  };

  // Critical Low Stock and Out of Stock products
  const criticalItems = useMemo(() => {
    return products.filter((p) => p.quantity <= p.minStockLevel);
  }, [products]);

  // Filtered products list for matrix table
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchName = product.name.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      // Category
      if (categoryFilter !== 'all' && product.category !== categoryFilter) {
        return false;
      }

      // Status / View filter
      if (filterView === 'low_and_out') {
        return product.quantity <= product.minStockLevel;
      }
      if (filterView === 'out_of_stock') {
        return product.quantity <= 0;
      }
      if (filterView === 'in_stock') {
        return product.quantity > product.minStockLevel;
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, filterView]);

  // Categories list for dropdown
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  // Export Inventory valuation report CSV
  const handleExportInventoryCsv = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Current Quantity',
      'Unit',
      'Min Stock Alert Threshold',
      'Retail Price (INR)',
      'Cost Price (INR)',
      'Total Valuation (INR)',
      'Status',
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      p.quantity,
      `"${p.unit || 'pcs'}"`,
      p.minStockLevel,
      p.price,
      p.costPrice || '',
      p.quantity * p.price,
      `"${p.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <PageContainer
      subtitle="Real-time warehouse stock ledger, low-stock threshold monitoring, and replenishment controls."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportInventoryCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Stock Report
          </Button>
        </div>
      }
    >
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Inventory Valuation */}
        <Card className="border-indigo-100 bg-linear-to-br from-white to-indigo-50/30">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Total Inventory Value
              </p>
              <p className="text-2xl font-bold text-indigo-950 mt-1">
                ₹{stats.totalInventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[11px] text-indigo-600">Calculated across all units</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* Total Physical Units */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Stocked Units
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalUnits.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-slate-500">Across {stats.totalProducts} catalog SKUs</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Boxes className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Warnings */}
        <Card
          className={`transition-colors cursor-pointer ${filterView === 'low_and_out' ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/20' : ''
            }`}
          onClick={() => setFilterView(filterView === 'low_and_out' ? 'all' : 'low_and_out')}
        >
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {stats.lowStockCount}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">Click to filter</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock (Depleted) */}
        <Card
          className={`transition-colors cursor-pointer ${filterView === 'out_of_stock' ? 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/20' : ''
            }`}
          onClick={() => setFilterView(filterView === 'out_of_stock' ? 'all' : 'out_of_stock')}
        >
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {stats.outOfStockCount}
              </p>
              <span className="text-[11px] text-rose-600 font-medium">Click to filter</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Boxes className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Replenishment Alert Banner (if any low/out of stock items) */}
      {criticalItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Stock Replenishment Required ({criticalItems.length} items need attention)
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    {stats.outOfStockCount > 0
                      ? `${stats.outOfStockCount} product(s) are completely sold out and ${stats.lowStockCount} item(s) are below their reorder threshold.`
                      : `${stats.lowStockCount} product(s) are at or below minimum warehouse threshold.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterView(filterView === 'low_and_out' ? 'all' : 'low_and_out')}
                  className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900"
                >
                  {filterView === 'low_and_out' ? 'Show All Products' : 'Filter Critical Items'}
                </Button>
              </div>
            </div>

            {/* Quick Restock Cards for Critical Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3.5 pt-3 border-t border-amber-200/60">
              {criticalItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between shadow-2xs"
                >
                  <div className="overflow-hidden mr-2">
                    <p className="font-bold text-xs text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-500 font-semibold bg-slate-100 px-1 py-0.2 rounded">
                        {item.sku}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${item.quantity === 0 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                      >
                        {item.quantity} in stock (Min: {item.minStockLevel})
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0 text-xs py-1 px-2.5 h-auto bg-amber-600 hover:bg-amber-700 shadow-none"
                    onClick={() => {
                      setSelectedProductForAdjust(item);
                      setAdjustDefaultMode('restock');
                    }}
                  >
                    + Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs Navigation: Stock Matrix vs Audit Logs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Live Stock Matrix ({filteredProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 cursor-pointer ${activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Audit & Movement Ledger ({stockLogs.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="space-y-4">
          {/* Matrix Filter Bar */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search stock by product name, SKU, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock Status Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={filterView}
                      onChange={(e) => setFilterView(e.target.value as any)}
                      className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Stock Statuses</option>
                      <option value="low_and_out">Low & Out of Stock Only</option>
                      <option value="out_of_stock">Out of Stock Only (0)</option>
                      <option value="in_stock">Healthy Stock (Above threshold)</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Matrix Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Product / SKU
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Stock Level & Threshold
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Inventory Value
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Stock Controls
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto flex flex-col items-center">
                          <Boxes className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-800 text-sm">No items matching criteria</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Try resetting your filters or search keywords.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const totalVal = product.quantity * product.price;
                      const ratio =
                        product.minStockLevel > 0
                          ? Math.min(100, Math.round((product.quantity / (product.minStockLevel * 2)) * 100))
                          : 100;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Product Info */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span
                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                                onClick={() => setSelectedProductForDetails(product)}
                              >
                                {product.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {product.sku}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  ₹{product.price} / {product.unit || 'pcs'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <CategoryBadge category={product.category} />
                          </td>

                          {/* Stock Level & Visual Bar */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col gap-1 min-w-[140px]">
                              <div className="flex items-baseline justify-between text-xs">
                                <span className="font-bold text-slate-900 font-mono text-sm">
                                  {product.quantity} <span className="text-xs font-normal text-slate-500">{product.unit || 'pcs'}</span>
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Min: {product.minStockLevel}
                                </span>
                              </div>

                              {/* Progress bar visual indicator */}
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${product.quantity <= 0
                                      ? 'bg-rose-500 w-0'
                                      : product.quantity <= product.minStockLevel
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                  style={{
                                    width: `${Math.max(5, ratio)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <StockBadge status={product.status} quantity={product.quantity} />
                          </td>

                          {/* Inventory Value */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 text-xs">
                              ₹{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick +10 Restock */}
                              <button
                                type="button"
                                onClick={() => handleQuickRestock(product, 10)}
                                className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                                title="Quick 1-Click +10 Units"
                              >
                                +10
                              </button>

                              {/* Open Adjustment Modal (Stock In) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForAdjust(product);
                                  setAdjustDefaultMode('restock');
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Stock In / Restock"
                              >
                                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                              </button>

                              {/* Open Adjustment Modal (Stock Out) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForAdjust(product);
                                  setAdjustDefaultMode('stock_out');
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Stock Out / Write-off"
                              >
                                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                              </button>

                              {/* Open Audit Adjustment */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForAdjust(product);
                                  setAdjustDefaultMode('audit');
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Adjust Stock / Set Count"
                              >
                                <SlidersHorizontal className="w-4 h-4" />
                              </button>

                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setSelectedProductForDetails(product)}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> items in inventory ledger
              </span>
              <span>
                Threshold Alert Active for {stats.lowStockCount + stats.outOfStockCount} item(s)
              </span>
            </div>
          </Card>
        </div>
      ) : (
        /* Stock Audit Movement Logs Tab */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Movement & Audit History</CardTitle>
                <CardDescription>
                  Chronological tracking of restocks, counter sales, write-offs, and stock adjustments
                </CardDescription>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                {stockLogs.length} Total Audit Records
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Timestamp
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Product & SKU
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Type
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Adjustment Delta
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Stock Transition
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Reason / Notes
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Logged By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {stockLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-800 text-sm">No stock logs recorded yet</p>
                      </td>
                    </tr>
                  ) : (
                    stockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                        {/* Timestamp */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                          {formatDate(log.timestamp)}
                        </td>

                        {/* Product */}
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{log.productName}</p>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                            {log.sku}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${log.changeType === 'restock'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.changeType === 'sale'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : log.changeType === 'damage'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                          >
                            {log.changeType}
                          </span>
                        </td>

                        {/* Delta */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`font-bold font-mono text-sm ${log.quantityChanged > 0
                                ? 'text-emerald-600'
                                : log.quantityChanged < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-600'
                              }`}
                          >
                            {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                          </span>
                        </td>

                        {/* Transition */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono">
                          {log.previousQuantity} → <strong className="text-slate-900">{log.newQuantity}</strong>
                        </td>

                        {/* Reason */}
                        <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                          {log.reason || '—'}
                        </td>

                        {/* Logged By */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                          {log.performedBy || 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(selectedProductForAdjust)}
        onClose={() => setSelectedProductForAdjust(null)}
        product={selectedProductForAdjust}
        defaultMode={adjustDefaultMode}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={Boolean(selectedProductForDetails)}
        onClose={() => setSelectedProductForDetails(null)}
        product={selectedProductForDetails}
        onAdjustStock={(prod) => {
          setSelectedProductForAdjust(prod);
          setAdjustDefaultMode('restock');
        }}
      />
    </PageContainer>
  );
};
