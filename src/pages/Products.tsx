import React, { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StockBadge, CategoryBadge } from '../components/ui/Badge';
import { useProducts } from '../contexts/ProductContext';
import { Product, StockStatus } from '../types';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { ProductDetailsModal } from '../components/products/ProductDetailsModal';
import { DeleteConfirmModal } from '../components/products/DeleteConfirmModal';
import { StockAdjustmentModal } from '../components/inventory/StockAdjustmentModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Download,
  RotateCcw,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'qty_asc' | 'qty_desc' | 'newest';

export const Products: React.FC = () => {
  const { products, categories, stats, resetToDemoData } = useProducts();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search filter
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchName = product.name.toLowerCase().includes(query);
          const matchSku = product.sku.toLowerCase().includes(query);
          const matchCategory = product.category.toLowerCase().includes(query);
          const matchBarcode = product.barcode?.toLowerCase().includes(query);
          if (!matchName && !matchSku && !matchCategory && !matchBarcode) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'in_stock' && product.status !== 'in_stock') return false;
          if (selectedStatus === 'low_stock' && product.status !== 'low_stock') return false;
          if (selectedStatus === 'out_of_stock' && product.status !== 'out_of_stock') return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'qty_asc':
            return a.quantity - b.quantity;
          case 'qty_desc':
            return b.quantity - a.quantity;
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Export catalog to JSON/CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Cost Price', 'Quantity', 'Min Stock Level', 'Unit', 'Barcode', 'Status'];
    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      p.price,
      p.costPrice || '',
      p.quantity,
      p.minStockLevel,
      `"${p.unit || 'pcs'}"`,
      `"${p.barcode || ''}"`,
      `"${p.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digitalsales_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer
      subtitle="Master catalog of retail items, SKU registry, retail pricing, and supplier categorization."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
            title="Export filtered list to CSV"
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setProductToEdit(null);
              setIsAddModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      }
    >
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Products
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalProducts}
              </p>
              <span className="text-[11px] text-slate-500">Across {stats.totalCategories} categories</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* In Stock Items */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                In Stock
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {stats.totalProducts - (stats.lowStockCount + stats.outOfStockCount)}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Ready for POS sales</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Low Stock
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {stats.lowStockCount}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">Near threshold</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Items */}
        <Card>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-rose-900 mt-1">
                {stats.outOfStockCount}
              </p>
              <span className="text-[11px] text-rose-600 font-medium">Restock needed</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Boxes className="w-5 h-5 stroke-[2]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar Section */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by Name, SKU, Category, or Barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock (≤ threshold)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest">Recently Added</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="qty_asc">Quantity: Low to High</option>
                  <option value="qty_desc">Quantity: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium">Quick Category:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer font-medium ${selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer font-medium ${selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Catalog Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Product & SKU
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Category
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Selling Price
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Cost Price
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Stock Level
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">No products found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                          ? 'Try clearing your search queries or category filters.'
                          : 'Your catalog is empty. Add your first product or reset sample demo catalog.'}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('all');
                              setSelectedStatus('all');
                            }}
                          >
                            Reset Filters
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus className="w-4 h-4" />}
                          onClick={() => {
                            setProductToEdit(null);
                            setIsAddModalOpen(true);
                          }}
                        >
                          Add Product
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setProductToView(product)}
                  >
                    {/* Product Name & SKU */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {product.sku}
                          </span>
                          {product.barcode && (
                            <span className="text-[10px] text-slate-400">
                              Barcode: {product.barcode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <CategoryBadge category={product.category} />
                    </td>

                    {/* Selling Price */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-900">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      <span className="text-[11px] font-normal text-slate-400 ml-1">
                        /{product.unit || 'pcs'}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 text-xs">
                      {product.costPrice !== undefined
                        ? `₹${product.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>

                    {/* Stock Level */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">
                          {product.quantity}
                        </span>
                        <span className="text-xs text-slate-500">{product.unit || 'pcs'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Alert at ≤ {product.minStockLevel}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StockBadge status={product.status} quantity={product.quantity} />
                    </td>

                    {/* Actions */}
                    <td
                      className="px-5 py-3.5 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setProductToView(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Adjust Stock */}
                        <button
                          type="button"
                          onClick={() => setProductToAdjust(product)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Adjust Stock Quantity"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>

                        {/* Edit Product */}
                        <button
                          type="button"
                          onClick={() => {
                            setProductToEdit(product);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Product */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> total catalog products
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetToDemoData}
              className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-medium"
              title="Reset to default sample catalog"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Catalog</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Product Details View Modal */}
      <ProductDetailsModal
        isOpen={Boolean(productToView)}
        onClose={() => setProductToView(null)}
        product={productToView}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setIsAddModalOpen(true);
        }}
        onAdjustStock={(prod) => {
          setProductToAdjust(prod);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        product={productToDelete}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(productToAdjust)}
        onClose={() => setProductToAdjust(null)}
        product={productToAdjust}
        defaultMode="restock"
      />
    </PageContainer>
  );
};
