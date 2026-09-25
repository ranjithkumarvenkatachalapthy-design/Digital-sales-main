import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProducts } from '../../contexts/ProductContext';
import { Sparkles, AlertCircle, Package, Tag, Layers, Barcode, DollarSign } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, categories, addCategory } = useProducts();

  const isEditMode = Boolean(productToEdit);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [unit, setUnit] = useState('pcs');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or populate form when opened or productToEdit changes
  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setErrors({});

      if (productToEdit) {
        setName(productToEdit.name);
        if (categories.includes(productToEdit.category)) {
          setCategory(productToEdit.category);
          setIsCustomCategory(false);
        } else {
          setIsCustomCategory(true);
          setCustomCategory(productToEdit.category);
        }
        setPrice(String(productToEdit.price));
        setCostPrice(productToEdit.costPrice !== undefined ? String(productToEdit.costPrice) : '');
        setSku(productToEdit.sku);
        setQuantity(String(productToEdit.quantity));
        setMinStockLevel(String(productToEdit.minStockLevel || 5));
        setUnit(productToEdit.unit || 'pcs');
        setBarcode(productToEdit.barcode || '');
        setDescription(productToEdit.description || '');
      } else {
        // Defaults for new product
        setName('');
        setCategory(categories[0] || 'Electronics');
        setCustomCategory('');
        setIsCustomCategory(false);
        setPrice('');
        setCostPrice('');
        setSku('');
        setQuantity('0');
        setMinStockLevel('5');
        setUnit('pcs');
        setBarcode('');
        setDescription('');
      }
    }
  }, [isOpen, productToEdit, categories]);

  // SKU Auto-Generator
  const generateAutoSku = () => {
    const prefix = (name ? name.slice(0, 3) : (category || 'ITEM')).toUpperCase().replace(/[^A-Z]/g, 'PRD');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generated = `${prefix}-${randomNum}`;
    setSku(generated);
    if (errors.sku) {
      setErrors((prev) => ({ ...prev, sku: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Product name is required';
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      errs.category = 'Category is required';
    }

    if (!sku.trim()) {
      errs.sku = 'SKU is required';
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      errs.price = 'Enter a valid price (>= 0)';
    }

    if (costPrice && (isNaN(Number(costPrice)) || Number(costPrice) < 0)) {
      errs.costPrice = 'Cost price must be a valid positive number';
    }

    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) < 0) {
      errs.quantity = 'Quantity must be 0 or greater';
    }

    if (minStockLevel === '' || isNaN(Number(minStockLevel)) || Number(minStockLevel) < 0) {
      errs.minStockLevel = 'Min stock level must be 0 or greater';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (isCustomCategory && customCategory.trim()) {
      addCategory(customCategory.trim());
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && productToEdit) {
        const result = await updateProduct(productToEdit.id, {
          name: name.trim(),
          category: finalCategory,
          price: Number(price),
          costPrice: costPrice ? Number(costPrice) : undefined,
          sku: sku.trim().toUpperCase(),
          quantity: Number(quantity),
          minStockLevel: Number(minStockLevel),
          unit,
          barcode: barcode.trim() || undefined,
          description: description.trim() || undefined,
        });

        if (result.success) {
          onClose();
        } else {
          setServerError(result.error || 'Failed to update product.');
        }
      } else {
        const result = await addProduct({
          name: name.trim(),
          category: finalCategory,
          price: Number(price),
          costPrice: costPrice ? Number(costPrice) : undefined,
          sku: sku.trim().toUpperCase(),
          quantity: Number(quantity),
          minStockLevel: Number(minStockLevel),
          unit,
          barcode: barcode.trim() || undefined,
          description: description.trim() || undefined,
        });

        if (result.success) {
          onClose();
        } else {
          setServerError(result.error || 'Failed to add product.');
        }
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Package className="w-4 h-4" />
          </div>
          <span>{isEditMode ? 'Edit Product Catalog Item' : 'Add New Product'}</span>
        </div>
      }
      description={
        isEditMode
          ? `Modify product details, pricing, and stock metadata for ${productToEdit?.sku}.`
          : 'Register a new item to the master catalog with SKU, category, and initial stock.'
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="product-form"
            isLoading={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="font-medium">{serverError}</span>
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <Input
          label="Product Name"
          placeholder="e.g. Wireless Ergonomic Mouse"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          required
        />

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            {!isCustomCategory ? (
              <div className="space-y-1.5">
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCategory(true);
                      setCustomCategory('');
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Add Custom Category...</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                  >
                    Select Existing
                  </button>
                </div>
              </div>
            )}
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Unit of Measure
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="pack">Pack / Box</option>
              <option value="bottle">Bottle / Can</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="litres">Litres (L)</option>
              <option value="box">Box (box)</option>
              <option value="pair">Pair</option>
            </select>
          </div>
        </div>

        {/* SKU & Barcode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                SKU Code <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateAutoSku}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <Input
              placeholder="e.g. ELEC-MOU-001"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value.toUpperCase());
                if (errors.sku) setErrors((prev) => ({ ...prev, sku: '' }));
              }}
              error={errors.sku}
              className="font-mono text-xs uppercase"
              required
            />
          </div>

          <Input
            label="Barcode / EAN (Optional)"
            placeholder="e.g. 890123456701"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            icon={<Barcode className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Pricing: Selling Price & Cost Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Selling Retail Price (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
            }}
            error={errors.price}
            required
            helperText="The price charged to customer at POS"
          />

          <Input
            label="Cost Price (₹) (Optional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={costPrice}
            onChange={(e) => {
              setCostPrice(e.target.value);
              if (errors.costPrice) setErrors((prev) => ({ ...prev, costPrice: '' }));
            }}
            error={errors.costPrice}
            helperText="For profit margin calculations"
          />
        </div>

        {/* Stock Quantity & Min Stock Alert Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current Stock Quantity"
            type="number"
            min="0"
            placeholder="0"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            error={errors.quantity}
            required
            helperText={isEditMode ? 'Direct update will log stock adjustment' : 'Starting warehouse stock count'}
          />

          <Input
            label="Low-Stock Alert Level"
            type="number"
            min="0"
            placeholder="5"
            value={minStockLevel}
            onChange={(e) => {
              setMinStockLevel(e.target.value);
              if (errors.minStockLevel) setErrors((prev) => ({ ...prev, minStockLevel: '' }));
            }}
            error={errors.minStockLevel}
            required
            helperText="Trigger warning when stock drops to or below this"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Description / Notes
          </label>
          <textarea
            rows={2}
            placeholder="Optional specifications, brand, warranty or location notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
      </form>
    </Modal>
  );
};
