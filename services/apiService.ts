
import { Product, InventoryEntry, User, UserRole, Category } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const API_BASE = 'https://inventry-mgmt-backend.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('omnistock_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const apiService = {
  async login(credentials: { email: string; password?: string }) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Auth failed');
    return response.json();
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/products`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Save failed');
    return response.json();
  },

  async getEntries(): Promise<InventoryEntry[]> {
    const response = await fetch(`${API_BASE}/entries`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Fetch failed');
    return response.json();
  },

  async saveEntries(entries: Partial<InventoryEntry>[]): Promise<any> {
    const response = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ entries })
    });
    if (!response.ok) throw new Error('Sync failed');
    return response.json();
  },

  async getAnalytics(): Promise<any> {
    const response = await fetch(`${API_BASE}/analytics`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Analytics failed');
    return response.json();
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Users failed');
    return response.json();
  },

  // Added createUser method to resolve property missing error
  async createUser(userData: any): Promise<User> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Create user failed');
    return response.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Update failed');
    return response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Delete failed');
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Update user failed');
    return response.json();
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Delete user failed');
  },

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Fetch categories failed');
    return response.json();
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Create category failed');
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Delete category failed');
  }
};
