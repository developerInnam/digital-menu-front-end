export type DiningType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card';
export type VegType = 'veg' | 'non-veg' | 'egg';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type CouponType = 'percentage' | 'flat' | 'bogo' | 'free_delivery';

export interface ProductVariant {
  id: string;
  name: string;
  priceDiff: number;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  vegType: VegType;
  spicyLevel: number; // 0 to 3
  prepTimeMinutes: number;
  isAvailable: boolean;
  stockStatus: StockStatus;
  stockCount: number;
  isPopular: boolean;
  isRecommended: boolean;
  discountPercent?: number;
  variants: ProductVariant[];
  addons: ProductAddon[];
  ingredients: string[];
  calories?: number;
}

export interface Category {
  id: string;
  vendorId: string;
  name: string;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
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

export interface CartItem {
  itemKey: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedAddons: ProductAddon[];
  specialInstructions?: string;
  itemPrice: number;
}

export interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
  variantName?: string;
  addons: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  diningType: DiningType;
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  gst: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  orderStatus: OrderStatus;
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
  discountType: CouponType;
  value: number; // % or flat amount
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
  happyHourDiscount: number; // percent
  happyHourStart: string; // e.g. "16:00"
  happyHourEnd: string; // e.g. "18:00"
  rating: number;
  totalReviews: number;
  createdAt: string;
  taxPercent?: number;
  tablesCount?: number;
  subscriptionPlan?: string;
  role?: 'admin' | 'vendor';
  permissions?: string[];
  isActive?: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
}

export type AppViewMode = 'customer' | 'vendor' | 'admin' | 'vendor_dashboard' | 'kds' | 'vendor_register';

export type Language = 'en' | 'ta' | 'hi' | 'ar';
