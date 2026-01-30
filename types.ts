
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string; // e.g., 70pc, 100pc
  capacity: number; // The number in brackets, e.g., 180
  category: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryEntry {
  id: string;
  productId: string;
  date: string; // ISO format
  count: number;
  userId: string;
}

export interface AnalyticsSummary {
  totalProducts: number;
  lowStockCount: number;
  monthlyMovement: number;
  topMovingItems: { name: string; value: number }[];
}
