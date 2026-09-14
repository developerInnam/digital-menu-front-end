// Types for initial data (simplified for server use)
export interface Vendor {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  ownerName: string;
  email: string;
  password?: string;
  phone: string;
  logo: string;
  banner: string;
  description: string;
  address: string;
  googleMapUrl: string;
  openingTime: string;
  closingTime: string;
  currency: string;
  gstNumber: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  tableServiceAvailable: boolean;
  happyHourEnabled: boolean;
  happyHourDiscount: number;
  happyHourStart: string;
  happyHourEnd: string;
  rating: number;
  totalReviews: number;
  tablesCount?: number;
  subscriptionPlan?: string;
  role?: 'admin' | 'vendor';
  permissions?: string[];
  isActive?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  vendorId: string;
  name: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  vegType: 'veg' | 'non-veg' | 'egg';
  spicyLevel: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount: number;
  isPopular: boolean;
  isRecommended: boolean;
  discountPercent?: number;
  variants: any[];
  addons: any[];
  ingredients: string[];
  calories?: number;
}

export interface ComboItem {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  includedItems: string[];
  isAvailable: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  diningType: 'dine_in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
  items: any[];
  subtotal: number;
  discount: number;
  gst: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedTimeMinutes: number;
  appliedCouponCode?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface Coupon {
  id: string;
  vendorId: string;
  code: string;
  discountType: 'percentage' | 'flat' | 'bogo' | 'free_delivery';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  isActive: boolean;
  validTill: string;
  usageCount: number;
}

export interface Customer {
  id: string;
  vendorId: string;
  name: string;
  phone: string;
  email?: string;
  ordersCount: number;
  totalOrders?: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit: string;
  lastVisited?: string;
  favoriteDishes?: string[];
}

export interface TableItem {
  id: string;
  vendorId: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceNumeric: number;
  desc: string;
  features: string[];
  tablesLimit: number;
  isActive: boolean;
}

// Static data removed - application now uses dynamic data from backend API
// These empty arrays are kept for type compatibility with backend seeding logic
export const initialVendors: Vendor[] = [];
export const initialCategories: Category[] = [];
export const initialProducts: Product[] = [];
export const initialCombos: ComboItem[] = [];
export const initialOrders: Order[] = [];
export const initialCoupons: Coupon[] = [];
export const initialCustomers: Customer[] = [];
export const initialTables: TableItem[] = [];

// Admin user for full system control
export const adminUser: Vendor = {
  id: 'admin-super',
  slug: 'admin',
  name: 'Super Admin',
  tagline: 'Platform Administrator',
  ownerName: 'System Admin',
  email: 'admin@dinesmart.com',
  password: 'admin123',
  phone: '+91 99999 99999',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=240&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  description: 'Platform administrator with full access to all vendor data and settings.',
  address: 'Digital Menu HQ',
  googleMapUrl: 'https://maps.google.com',
  openingTime: '00:00 AM',
  closingTime: '11:59 PM',
  currency: '₹',
  gstNumber: '',
  whatsapp: '+919999999999',
  instagram: '@dinesmart',
  facebook: 'fb.com/dinesmart',
  deliveryAvailable: false,
  pickupAvailable: false,
  tableServiceAvailable: false,
  happyHourEnabled: false,
  happyHourDiscount: 0,
  happyHourStart: '00:00',
  happyHourEnd: '00:00',
  rating: 5.0,
  totalReviews: 0,
  tablesCount: 0,
  subscriptionPlan: 'enterprise',
  role: 'admin',
  permissions: ['admin:manage_vendors', 'admin:view_all_data', 'admin:delete_data'],
  isActive: true,
  createdAt: new Date().toISOString()
};

// Demo vendor for testing purposes (used when database is empty)
export const demoVendor: Vendor = {
  id: 'vendor-demo',
  slug: 'demo-restaurant',
  name: 'Demo Restaurant',
  tagline: 'Sample Restaurant for Testing',
  ownerName: 'Demo Owner',
  email: 'demo@restaurant.com',
  password: 'demo123',
  phone: '+91 98765 43210',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=240&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
  description: 'This is a demo restaurant for testing the application.',
  address: 'Demo Address, City',
  googleMapUrl: 'https://maps.google.com',
  openingTime: '10:00 AM',
  closingTime: '10:00 PM',
  currency: '₹',
  gstNumber: '',
  whatsapp: '+919876543210',
  instagram: '@demo',
  facebook: 'fb.com/demo',
  deliveryAvailable: true,
  pickupAvailable: true,
  tableServiceAvailable: true,
  happyHourEnabled: false,
  happyHourDiscount: 0,
  happyHourStart: '00:00',
  happyHourEnd: '00:00',
  rating: 4.5,
  totalReviews: 0,
  tablesCount: 5,
  subscriptionPlan: 'pro',
  role: 'vendor',
  permissions: ['vendor:manage_menu', 'vendor:manage_orders', 'vendor:manage_categories', 'vendor:manage_tables', 'vendor:manage_coupons', 'vendor:view_analytics', 'vendor:edit_restaurant', 'vendor:manage_kds'],
  isActive: true,
  createdAt: new Date().toISOString()
};
