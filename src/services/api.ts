import {
  Vendor,
  Category,
  Product,
  Order,
  TableItem,
  Coupon,
  Customer,
  OrderStatus,
  StockStatus
} from '../types';
import { SubscriptionPlan } from '../data/subscriptionPlans';

export interface DbStatusData {
  engine: 'mongodb' | 'in_memory_fallback';
  isConnected: boolean;
  uriConfigured: boolean;
  uriPreview: string;
  dbName: string;
  counts: {
    vendors: number;
    categories: number;
    products: number;
    orders: number;
    tables: number;
    coupons: number;
    customers: number;
  };
  lastSyncedAt: string;
  message: string;
}

const API_BASE = (window as any).VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://digital-menu-backend-ten.vercel.app/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Network request failed');
    try {
      const json = JSON.parse(errorText);
      throw new Error(json.error || `HTTP ${res.status}: ${res.statusText}`);
    } catch {
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
  }
  return res.json();
}

export const api = {
  // DB & System
  async getDbStatus(): Promise<DbStatusData> {
    const res = await fetch(`${API_BASE}/db/status`);
    return handleResponse<DbStatusData>(res);
  },

  async seedDatabase(force = false): Promise<{ seeded: boolean; message: string; status: DbStatusData }> {
    const res = await fetch(`${API_BASE}/db/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force })
    });
    return handleResponse(res);
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    const res = await fetch(`${API_BASE}/vendors`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Vendor[]>(res);
  },

  async getVendorById(id: string): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Vendor>(res);
  },

  async createVendor(vendor: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vendor)
    });
    return handleResponse<Vendor>(res);
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Vendor>(res);
  },

  async deleteVendor(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/vendors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Categories
  async getCategories(vendorId?: string): Promise<Category[]> {
    const url = vendorId
      ? `${API_BASE}/categories?vendorId=${encodeURIComponent(vendorId)}`
      : `${API_BASE}/categories`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Category[]>(res);
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    });
    return handleResponse<Category>(res);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Category>(res);
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async reorderCategories(vendorId: string, orderedIds: string[]): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/reorder`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vendorId, orderedIds })
    });
    return handleResponse<Category[]>(res);
  },

  // Products
  async getProducts(params?: { vendorId?: string; categoryId?: string; search?: string; vegType?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.vendorId) query.set('vendorId', params.vendorId);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.search) query.set('search', params.search);
    if (params?.vegType) query.set('vegType', params.vegType);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Product[]>(res);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Product>(res);
  },

  async updateProductStock(id: string, stockStatus: StockStatus, stockCount?: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stockStatus, stockCount })
    });
    return handleResponse<Product>(res);
  },

  async toggleProductAvailability(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Orders
  async getOrders(params?: { vendorId?: string; phone?: string; status?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.vendorId) query.set('vendorId', params.vendorId);
    if (params?.phone) query.set('phone', params.phone);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Order[]>(res);
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(order)
    });
    return handleResponse<Order>(res);
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<Order>(res);
  },

  async addOrderReview(id: string, rating: number, comment: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    return handleResponse<Order>(res);
  },

  // Tables
  async getTables(vendorId?: string): Promise<TableItem[]> {
    const url = vendorId
      ? `${API_BASE}/tables?vendorId=${encodeURIComponent(vendorId)}`
      : `${API_BASE}/tables`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<TableItem[]>(res);
  },

  async createTable(table: Partial<TableItem>): Promise<TableItem> {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(table)
    });
    return handleResponse<TableItem>(res);
  },

  async deleteTable(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/tables/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Coupons
  async getCoupons(vendorId?: string): Promise<Coupon[]> {
    const url = vendorId
      ? `${API_BASE}/coupons?vendorId=${encodeURIComponent(vendorId)}`
      : `${API_BASE}/coupons`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Coupon[]>(res);
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(coupon)
    });
    return handleResponse<Coupon>(res);
  },

  async toggleCoupon(id: string): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse<Coupon>(res);
  },

  // Customers
  async getCustomers(vendorId?: string): Promise<Customer[]> {
    const url = vendorId
      ? `${API_BASE}/customers?vendorId=${encodeURIComponent(vendorId)}`
      : `${API_BASE}/customers`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Customer[]>(res);
  },

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/subscription-plans`, {
      headers: getAuthHeaders()
    });
    return handleResponse<SubscriptionPlan[]>(res);
  },

  async setSubscriptionPlans(plans: SubscriptionPlan[]): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/subscription-plans`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plans })
    });
    return handleResponse<SubscriptionPlan[]>(res);
  }
};
