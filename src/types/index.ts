/**
 * DigitalSales Shared Types
 * Base project foundation types for team collaboration
 */

export type UserRole = 'admin' | 'cashier' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TeamMember {
  id: string;
  number: number;
  name: string;
  roleDescription: string;
  modules: string[];
  status: 'foundation' | 'in-progress' | 'planned';
}

export interface NavigationItem {
  name: string;
  path: string;
  description: string;
  memberOwner: string;
  badge?: string;
}

/**
 * Product & Inventory Management Types (Member 2 - Ranjith Kumar)
 */

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  sku: string;
  quantity: number;
  minStockLevel: number;
  unit?: string;
  barcode?: string;
  description?: string;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export type StockChangeType = 'restock' | 'sale' | 'adjustment' | 'damage' | 'return';

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  changeType: StockChangeType;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  timestamp: string;
  performedBy?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
}

