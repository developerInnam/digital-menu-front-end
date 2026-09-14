import mongoose, { Schema, Model } from 'mongoose';

// Vendor Schema
export const VendorSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  ownerName: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  googleMapUrl: { type: String, default: '' },
  openingTime: { type: String, default: '10:00 AM' },
  closingTime: { type: String, default: '11:00 PM' },
  currency: { type: String, default: '₹' },
  gstNumber: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  deliveryAvailable: { type: Boolean, default: true },
  pickupAvailable: { type: Boolean, default: true },
  tableServiceAvailable: { type: Boolean, default: true },
  happyHourEnabled: { type: Boolean, default: false },
  happyHourDiscount: { type: Number, default: 15 },
  happyHourStart: { type: String, default: '16:00' },
  happyHourEnd: { type: String, default: '18:00' },
  rating: { type: Number, default: 4.8 },
  totalReviews: { type: Number, default: 100 },
  taxPercent: { type: Number, default: 5 },
  tablesCount: { type: Number, default: 12 },
  subscriptionPlan: { type: String, default: 'pro' },
  role: { type: String, enum: ['admin', 'vendor'], default: 'vendor' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true, strict: false });

// Category Schema
export const CategorySchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  iconName: { type: String, default: 'Utensils' },
  displayOrder: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

// Product Schema
export const ProductSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  categoryId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  vegType: { type: String, enum: ['veg', 'non-veg', 'egg'], default: 'veg' },
  spicyLevel: { type: Number, default: 0 },
  prepTimeMinutes: { type: Number, default: 15 },
  isAvailable: { type: Boolean, default: true },
  stockStatus: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  stockCount: { type: Number, default: 50 },
  isPopular: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0 },
  calories: { type: Number, default: 400 },
  ingredients: [{ type: String }],
  variants: [{ type: Object }],
  addons: [{ type: Object }]
}, { timestamps: true, strict: false });

// Order Schema
export const OrderSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  orderNumber: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true, index: true },
  diningType: { type: String, required: true },
  tableNumber: { type: String, default: '' },
  deliveryAddress: { type: String, default: '' },
  notes: { type: String, default: '' },
  items: [{ type: Object }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'upi' },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'received', index: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  estimatedTimeMinutes: { type: Number, default: 20 },
  appliedCouponCode: { type: String },
  review: {
    rating: { type: Number },
    comment: { type: String },
    createdAt: { type: String }
  }
}, { timestamps: true, strict: false });

// Table Schema
export const TableSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, default: 'available' },
  currentOrderId: { type: String }
}, { timestamps: true, strict: false });

// Coupon Schema
export const CouponSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  code: { type: String, required: true, index: true },
  discountType: { type: String, default: 'percentage' },
  value: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validTill: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

// Customer Schema
export const CustomerSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  vendorId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, default: '' },
  ordersCount: { type: Number, default: 1 },
  totalOrders: { type: Number, default: 1 },
  totalSpent: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  lastVisit: { type: String, default: () => new Date().toISOString().split('T')[0] },
  lastVisited: { type: String, default: () => new Date().toISOString().split('T')[0] },
  favoriteDishes: [{ type: String }]
}, { timestamps: true, strict: false });

// Subscription Plan Schema
export const SubscriptionPlanSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  priceNumeric: { type: Number, required: true },
  desc: { type: String, required: true },
  features: [{ type: String }],
  tablesLimit: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

// Explicit Model<any> typing avoids TypeScript Query signature clashes
export const VendorModel: Model<any> = (mongoose.models && mongoose.models.Vendor) ? mongoose.models.Vendor : mongoose.model('Vendor', VendorSchema);
export const CategoryModel: Model<any> = (mongoose.models && mongoose.models.Category) ? mongoose.models.Category : mongoose.model('Category', CategorySchema);
export const ProductModel: Model<any> = (mongoose.models && mongoose.models.Product) ? mongoose.models.Product : mongoose.model('Product', ProductSchema);
export const OrderModel: Model<any> = (mongoose.models && mongoose.models.Order) ? mongoose.models.Order : mongoose.model('Order', OrderSchema);
export const TableModel: Model<any> = (mongoose.models && mongoose.models.Table) ? mongoose.models.Table : mongoose.model('Table', TableSchema);
export const CouponModel: Model<any> = (mongoose.models && mongoose.models.Coupon) ? mongoose.models.Coupon : mongoose.model('Coupon', CouponSchema);
export const CustomerModel: Model<any> = (mongoose.models && mongoose.models.Customer) ? mongoose.models.Customer : mongoose.model('Customer', CustomerSchema);
export const SubscriptionPlanModel: Model<any> = (mongoose.models && mongoose.models.SubscriptionPlan) ? mongoose.models.SubscriptionPlan : mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
