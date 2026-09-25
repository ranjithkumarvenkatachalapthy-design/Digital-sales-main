import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, StockLog, StockStatus, StockChangeType, InventoryStats } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ProductContextType {
  products: Product[];
  stockLogs: StockLog[];
  isLoading: boolean;
  error: string | null;
  categories: string[];
  stats: InventoryStats;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  adjustStock: (productId: string, quantityChange: number, changeType: StockChangeType, reason?: string) => Promise<{ success: boolean; error?: string }>;
  reduceStockForSale: (items: Array<{ productId: string; quantity: number }>) => Promise<{ success: boolean; error?: string; failedItems?: string[] }>;
  getProductById: (id: string) => Product | undefined;
  getProductBySku: (sku: string) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  addCategory: (category: string) => void;
  resetToDemoData: () => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS_KEY = 'digitalsales_products_v1';
const LOCAL_STORAGE_LOGS_KEY = 'digitalsales_stock_logs_v1';

const calculateStockStatus = (quantity: number, minStockLevel: number): StockStatus => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= minStockLevel) return 'low_stock';
  return 'in_stock';
};

const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_101',
    name: 'Wireless Bluetooth Mouse',
    category: 'Electronics',
    price: 799,
    costPrice: 450,
    sku: 'ELEC-MOU-001',
    quantity: 28,
    minStockLevel: 10,
    unit: 'pcs',
    barcode: '890123456701',
    description: 'Ergonomic 2.4GHz rechargeable wireless optical mouse with silent clicks.',
    status: 'in_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'prod_102',
    name: 'Mechanical Gaming Keyboard RGB',
    category: 'Electronics',
    price: 2499,
    costPrice: 1600,
    sku: 'ELEC-KEY-002',
    quantity: 8,
    minStockLevel: 10,
    unit: 'pcs',
    barcode: '890123456702',
    description: 'Blue switch mechanical backlit keyboard with anti-ghosting keys.',
    status: 'low_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'prod_103',
    name: 'Premium Arabica Coffee Beans (500g)',
    category: 'Beverages',
    price: 550,
    costPrice: 320,
    sku: 'BEV-COF-003',
    quantity: 45,
    minStockLevel: 15,
    unit: 'pack',
    barcode: '890123456703',
    description: 'Single-origin medium roast Arabica coffee beans from Chikmagalur.',
    status: 'in_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'prod_104',
    name: 'Organic Green Tea Bags (Pack of 50)',
    category: 'Beverages',
    price: 320,
    costPrice: 180,
    sku: 'BEV-TEA-004',
    quantity: 4,
    minStockLevel: 12,
    unit: 'box',
    barcode: '890123456704',
    description: 'Antioxidant-rich whole leaf Himalayan green tea pyramid bags.',
    status: 'low_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'prod_105',
    name: 'Almond & Honey Granola Cereal (400g)',
    category: 'Groceries',
    price: 399,
    costPrice: 240,
    sku: 'GROC-GRA-005',
    quantity: 35,
    minStockLevel: 10,
    unit: 'pack',
    barcode: '890123456705',
    description: 'Crunchy baked oats with roasted California almonds and wildflower honey.',
    status: 'in_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'prod_106',
    name: 'Cold Pressed Virgin Olive Oil (1L)',
    category: 'Groceries',
    price: 950,
    costPrice: 680,
    sku: 'GROC-OIL-006',
    quantity: 0,
    minStockLevel: 8,
    unit: 'bottle',
    barcode: '890123456706',
    description: 'Extra virgin first cold pressed Mediterranean olive oil for gourmet cooking.',
    status: 'out_of_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'prod_107',
    name: 'A5 Spiral Hardcover Notebook (200 Pgs)',
    category: 'Stationery',
    price: 180,
    costPrice: 90,
    sku: 'STAT-NOT-007',
    quantity: 60,
    minStockLevel: 20,
    unit: 'pcs',
    barcode: '890123456707',
    description: '80 GSM dot-grid acid-free paper with waterproof matte cover.',
    status: 'in_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'prod_108',
    name: 'Gel Roller Pen 0.5mm Blue (Box of 10)',
    category: 'Stationery',
    price: 250,
    costPrice: 140,
    sku: 'STAT-PEN-008',
    quantity: 6,
    minStockLevel: 15,
    unit: 'box',
    barcode: '890123456708',
    description: 'Quick-drying smudge-proof Japanese ink gel pen set.',
    status: 'low_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'prod_109',
    name: 'Hydrating Vitamin C Face Serum (30ml)',
    category: 'Personal Care',
    price: 699,
    costPrice: 380,
    sku: 'CARE-SER-009',
    quantity: 19,
    minStockLevel: 8,
    unit: 'bottle',
    barcode: '890123456709',
    description: '15% ethyl ascorbic acid with hyaluronic acid and ferulic acid.',
    status: 'in_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'prod_110',
    name: 'Stainless Steel Insulated Water Bottle (750ml)',
    category: 'Lifestyle',
    price: 849,
    costPrice: 480,
    sku: 'LIFE-BOT-010',
    quantity: 0,
    minStockLevel: 5,
    unit: 'pcs',
    barcode: '890123456710',
    description: 'Double-wall vacuum insulated flask keeps drinks cold for 24h / hot for 12h.',
    status: 'out_of_stock',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const INITIAL_DEMO_LOGS: StockLog[] = [
  {
    id: 'log_001',
    productId: 'prod_101',
    productName: 'Wireless Bluetooth Mouse',
    sku: 'ELEC-MOU-001',
    changeType: 'restock',
    quantityChanged: 30,
    previousQuantity: 0,
    newQuantity: 30,
    reason: 'Initial supplier shipment received',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    performedBy: 'Ranjith Kumar',
  },
  {
    id: 'log_002',
    productId: 'prod_101',
    productName: 'Wireless Bluetooth Mouse',
    sku: 'ELEC-MOU-001',
    changeType: 'sale',
    quantityChanged: -2,
    previousQuantity: 30,
    newQuantity: 28,
    reason: 'POS Counter Sale (Bill #INV-10021)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    performedBy: 'Prithvi',
  },
  {
    id: 'log_003',
    productId: 'prod_106',
    productName: 'Cold Pressed Virgin Olive Oil (1L)',
    sku: 'GROC-OIL-006',
    changeType: 'sale',
    quantityChanged: -5,
    previousQuantity: 5,
    newQuantity: 0,
    reason: 'Bulk Customer Order (Stock Depleted)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    performedBy: 'Prithvi',
  },
  {
    id: 'log_004',
    productId: 'prod_102',
    productName: 'Mechanical Gaming Keyboard RGB',
    sku: 'ELEC-KEY-002',
    changeType: 'adjustment',
    quantityChanged: -2,
    previousQuantity: 10,
    newQuantity: 8,
    reason: 'Display unit relocation to showroom counter',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    performedBy: 'Ranjith Kumar',
  },
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data from LocalStorage or Fallback Seed
  const loadInitialData = useCallback(() => {
    try {
      const storedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      const storedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);

      if (storedProducts) {
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        // Ensure status is up-to-date with current threshold
        const normalized = parsedProducts.map((p) => ({
          ...p,
          status: calculateStockStatus(p.quantity, p.minStockLevel || 5),
        }));
        setProducts(normalized);
      } else {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
        setProducts(INITIAL_DEMO_PRODUCTS);
      }

      if (storedLogs) {
        setStockLogs(JSON.parse(storedLogs));
      } else {
        localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(INITIAL_DEMO_LOGS));
        setStockLogs(INITIAL_DEMO_LOGS);
      }
    } catch (err) {
      console.error('Failed to load local product cache:', err);
      setProducts(INITIAL_DEMO_PRODUCTS);
      setStockLogs(INITIAL_DEMO_LOGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Sync to local storage on state changes
  const saveProductsToStorage = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch (err) {
      console.error('Failed to save products to localStorage:', err);
    }
  };

  const saveLogsToStorage = (updatedLogs: StockLog[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updatedLogs));
    } catch (err) {
      console.error('Failed to save logs to localStorage:', err);
    }
  };

  // Add a new product
  const addProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      const trimmedSku = productData.sku.trim().toUpperCase();
      const existingWithSku = products.find(
        (p) => p.sku.trim().toUpperCase() === trimmedSku
      );

      if (existingWithSku) {
        return { success: false, error: `A product with SKU "${trimmedSku}" already exists.` };
      }

      const minStock = Number(productData.minStockLevel) >= 0 ? Number(productData.minStockLevel) : 5;
      const initialQty = Number(productData.quantity) || 0;
      const now = new Date().toISOString();

      const newProduct: Product = {
        ...productData,
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: productData.name.trim(),
        category: productData.category.trim() || 'General',
        sku: trimmedSku,
        price: Number(productData.price) || 0,
        costPrice: productData.costPrice !== undefined ? Number(productData.costPrice) : undefined,
        quantity: initialQty,
        minStockLevel: minStock,
        unit: productData.unit || 'pcs',
        barcode: productData.barcode?.trim() || undefined,
        description: productData.description?.trim() || undefined,
        status: calculateStockStatus(initialQty, minStock),
        createdAt: now,
        updatedAt: now,
      };

      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      saveProductsToStorage(updatedProducts);

      // Create initial stock audit entry
      if (initialQty > 0) {
        const initialLog: StockLog = {
          id: `log_${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          changeType: 'restock',
          quantityChanged: initialQty,
          previousQuantity: 0,
          newQuantity: initialQty,
          reason: 'Initial Product Registration',
          timestamp: now,
          performedBy: user?.name || 'Ranjith Kumar',
        };
        const updatedLogs = [initialLog, ...stockLogs];
        setStockLogs(updatedLogs);
        saveLogsToStorage(updatedLogs);
      }

      // If Supabase is connected, attempt sync (silent fallback)
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('products').insert([newProduct]);
        } catch (dbErr) {
          console.warn('Supabase sync notice: local state preserved.', dbErr);
        }
      }

      return { success: true, product: newProduct };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add product.' };
    }
  };

  // Update existing product
  const updateProduct = async (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt'>>
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      const target = products.find((p) => p.id === id);
      if (!target) {
        return { success: false, error: 'Product not found.' };
      }

      if (updates.sku) {
        const trimmedSku = updates.sku.trim().toUpperCase();
        const duplicate = products.find(
          (p) => p.sku.trim().toUpperCase() === trimmedSku && p.id !== id
        );
        if (duplicate) {
          return { success: false, error: `SKU "${trimmedSku}" is already taken by another product.` };
        }
      }

      const now = new Date().toISOString();
      const updatedQty = updates.quantity !== undefined ? Number(updates.quantity) : target.quantity;
      const updatedMinStock = updates.minStockLevel !== undefined ? Number(updates.minStockLevel) : target.minStockLevel;

      const updatedProduct: Product = {
        ...target,
        ...updates,
        sku: updates.sku ? updates.sku.trim().toUpperCase() : target.sku,
        quantity: updatedQty,
        minStockLevel: updatedMinStock,
        status: calculateStockStatus(updatedQty, updatedMinStock),
        updatedAt: now,
      };

      const updatedProducts = products.map((p) => (p.id === id ? updatedProduct : p));
      setProducts(updatedProducts);
      saveProductsToStorage(updatedProducts);

      // Log quantity changes if directly edited in form
      if (updates.quantity !== undefined && updates.quantity !== target.quantity) {
        const delta = updatedQty - target.quantity;
        const auditLog: StockLog = {
          id: `log_${Date.now()}`,
          productId: target.id,
          productName: updatedProduct.name,
          sku: updatedProduct.sku,
          changeType: delta > 0 ? 'restock' : 'adjustment',
          quantityChanged: delta,
          previousQuantity: target.quantity,
          newQuantity: updatedQty,
          reason: 'Manual edit in Product details',
          timestamp: now,
          performedBy: user?.name || 'Ranjith Kumar',
        };
        const updatedLogs = [auditLog, ...stockLogs];
        setStockLogs(updatedLogs);
        saveLogsToStorage(updatedLogs);
      }

      // If Supabase is connected, attempt sync
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('products').update(updatedProduct).eq('id', id);
        } catch (dbErr) {
          console.warn('Supabase sync notice: local state preserved.', dbErr);
        }
      }

      return { success: true, product: updatedProduct };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update product.' };
    }
  };

  // Delete product
  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const exists = products.some((p) => p.id === id);
      if (!exists) {
        return { success: false, error: 'Product not found.' };
      }

      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      saveProductsToStorage(updatedProducts);

      // If Supabase is connected, attempt sync
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('products').delete().eq('id', id);
        } catch (dbErr) {
          console.warn('Supabase sync notice: local state preserved.', dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete product.' };
    }
  };

  // Adjust stock for Inventory module
  const adjustStock = async (
    productId: string,
    quantityChange: number,
    changeType: StockChangeType,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      const previousQuantity = product.quantity;
      const newQuantity = Math.max(0, previousQuantity + quantityChange);
      const now = new Date().toISOString();

      const updatedProduct: Product = {
        ...product,
        quantity: newQuantity,
        status: calculateStockStatus(newQuantity, product.minStockLevel),
        updatedAt: now,
      };

      const updatedProducts = products.map((p) => (p.id === productId ? updatedProduct : p));
      setProducts(updatedProducts);
      saveProductsToStorage(updatedProducts);

      const auditLog: StockLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        changeType,
        quantityChanged: quantityChange,
        previousQuantity,
        newQuantity,
        reason: reason || `Stock ${quantityChange >= 0 ? 'added' : 'reduced'} via Inventory terminal`,
        timestamp: now,
        performedBy: user?.name || 'Ranjith Kumar',
      };

      const updatedLogs = [auditLog, ...stockLogs];
      setStockLogs(updatedLogs);
      saveLogsToStorage(updatedLogs);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('products').update({ quantity: newQuantity }).eq('id', productId);
        } catch (dbErr) {
          console.warn('Supabase sync notice: local state preserved.', dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to adjust stock.' };
    }
  };

  // Reduce stock for Sales/Billing module (Shared integration for Member 3 Prithvi)
  const reduceStockForSale = async (
    items: Array<{ productId: string; quantity: number }>
  ): Promise<{ success: boolean; error?: string; failedItems?: string[] }> => {
    try {
      const failed: string[] = [];
      const now = new Date().toISOString();
      const logsToAdd: StockLog[] = [];

      const updatedProducts = products.map((prod) => {
        const itemToSell = items.find((i) => i.productId === prod.id);
        if (!itemToSell) return prod;

        if (prod.quantity < itemToSell.quantity) {
          failed.push(`${prod.name} (Only ${prod.quantity} available in stock)`);
        }

        const newQty = Math.max(0, prod.quantity - itemToSell.quantity);

        logsToAdd.push({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          changeType: 'sale',
          quantityChanged: -itemToSell.quantity,
          previousQuantity: prod.quantity,
          newQuantity: newQty,
          reason: 'Checkout Sale Transaction',
          timestamp: now,
          performedBy: user?.name || 'Sales Cashier',
        });

        return {
          ...prod,
          quantity: newQty,
          status: calculateStockStatus(newQty, prod.minStockLevel),
          updatedAt: now,
        };
      });

      if (failed.length > 0) {
        return {
          success: false,
          error: `Insufficient stock for items: ${failed.join(', ')}`,
          failedItems: failed,
        };
      }

      setProducts(updatedProducts);
      saveProductsToStorage(updatedProducts);

      const updatedLogs = [...logsToAdd, ...stockLogs];
      setStockLogs(updatedLogs);
      saveLogsToStorage(updatedLogs);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update stock for sale.' };
    }
  };

  const getProductById = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const getProductBySku = useCallback(
    (sku: string) => products.find((p) => p.sku.trim().toUpperCase() === sku.trim().toUpperCase()),
    [products]
  );

  const getProductByBarcode = useCallback(
    (barcode: string) => products.find((p) => p.barcode?.trim() === barcode.trim()),
    [products]
  );

  const getLowStockProducts = useCallback(
    () => products.filter((p) => p.quantity <= p.minStockLevel),
    [products]
  );

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
    }
  };

  const resetToDemoData = () => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(INITIAL_DEMO_LOGS));
    setProducts(INITIAL_DEMO_PRODUCTS);
    setStockLogs(INITIAL_DEMO_LOGS);
  };

  const refreshProducts = async () => {
    loadInitialData();
  };

  // Distinct category list
  const categories = useMemo(() => {
    const fromProducts = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    const standardCategories = ['Electronics', 'Beverages', 'Groceries', 'Stationery', 'Personal Care', 'Lifestyle', 'Hardware', 'Snacks'];
    const merged = Array.from(new Set([...standardCategories, ...fromProducts, ...customCategories]));
    return merged.sort();
  }, [products, customCategories]);

  // Overall Inventory & Product Stats
  const stats: InventoryStats = useMemo(() => {
    let totalUnits = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      totalUnits += p.quantity;
      totalInventoryValue += p.quantity * p.price;
      if (p.quantity <= 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minStockLevel) {
        lowStockCount++;
      }
    });

    return {
      totalProducts: products.length,
      totalUnits,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      totalCategories: new Set(products.map((p) => p.category)).size,
    };
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        stockLogs,
        isLoading,
        error,
        categories,
        stats,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        reduceStockForSale,
        getProductById,
        getProductBySku,
        getProductByBarcode,
        getLowStockProducts,
        addCategory,
        resetToDemoData,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
