import mongoose from 'mongoose';
import {
  VendorModel,
  CategoryModel,
  ProductModel,
  OrderModel,
  TableModel,
  CouponModel,
  CustomerModel,
  SubscriptionPlanModel
} from './models/schemas.js';
import { hashPassword } from './utils/auth.js';
import {
  initialVendors,
  initialCategories,
  initialProducts,
  initialOrders,
  initialCoupons,
  initialCustomers,
  initialTables,
  demoVendor,
  adminUser,
  type SubscriptionPlan,
  type Customer
} from './src/data/initialData.js';

export interface DbStatusInfo {
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
    subscriptionPlans: number;
  };
  lastSyncedAt: string;
  message: string;
}

// In-memory persistent cache for fallback or instant offline preview
const memoryDb = {
  vendors: [...initialVendors],
  categories: [...initialCategories],
  products: [...initialProducts],
  orders: [...initialOrders],
  tables: [...initialTables],
  coupons: [...initialCoupons],
  customers: [...initialCustomers],
  subscriptionPlans: [] as SubscriptionPlan[]
};

let isMongoConnected = false;
let connectionAttemptFinished = false;
let connectionErrorMessage = '';

export async function initDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL;

  if (!uri || uri.trim() === '') {
    connectionAttemptFinished = true;
    console.log('ℹ️ [Database] No MONGODB_URI provided in environment variables.');
    console.log('⚡ [Database] Initializing dynamic in-memory store with Mongoose schema structures.');
    return;
  }

  try {
    console.log(`⏳ [MongoDB] Connecting to MongoDB instance...`);
    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isMongoConnected = true;
    connectionAttemptFinished = true;
    console.log('✅ [MongoDB] Successfully connected to MongoDB database!');

    // Seed database if empty
    await seedDatabaseIfEmpty();
  } catch (err: any) {
    isMongoConnected = false;
    connectionAttemptFinished = true;
    connectionErrorMessage = err.message || 'Connection timed out';
    console.warn(`⚠️ [MongoDB] Could not connect to remote MongoDB: ${connectionErrorMessage}`);
    console.log('⚡ [Database] Fallback in-memory MongoDB store is active and serving dynamic requests seamlessly.');
  }
}

export async function seedDatabaseIfEmpty(force = false): Promise<{ seeded: boolean; message: string }> {
  if (isMongoConnected) {
    try {
      const vendorCount = await VendorModel.countDocuments();
      if (vendorCount === 0 || force) {
        if (force) {
          await Promise.all([
            VendorModel.deleteMany({}),
            CategoryModel.deleteMany({}),
            ProductModel.deleteMany({}),
            OrderModel.deleteMany({}),
            TableModel.deleteMany({}),
            CouponModel.deleteMany({}),
            CustomerModel.deleteMany({}),
            SubscriptionPlanModel.deleteMany({})
          ]);
        }

        // If database is empty, seed with admin and demo vendor
        const vendorsToSeed = vendorCount === 0 ? [adminUser, demoVendor] : initialVendors;

        // Hash passwords before seeding
        const vendorsWithHashedPasswords = await Promise.all(
          vendorsToSeed.map(async (vendor) => {
            if (vendor.password) {
              return {
                ...vendor,
                password: await hashPassword(vendor.password)
              };
            }
            return vendor;
          })
        );

        await VendorModel.insertMany(vendorsWithHashedPasswords as any[]);
        await CategoryModel.insertMany(initialCategories as any[]);
        await ProductModel.insertMany(initialProducts as any[]);
        await OrderModel.insertMany(initialOrders as any[]);
        await TableModel.insertMany(initialTables as any[]);
        await CouponModel.insertMany(initialCoupons as any[]);
        await CustomerModel.insertMany(initialCustomers as any[]);

        // Seed default subscription plans if empty
        const planCount = await SubscriptionPlanModel.countDocuments();
        if (planCount === 0) {
          const defaultPlans = [
            {
              id: 'starter',
              name: 'Starter',
              price: '₹1,499/mo',
              priceNumeric: 1499,
              desc: 'Up to 10 tables, QR ordering, KDS, & basic analytics',
              features: ['QR Ordering', 'Kitchen Display System', 'Basic Analytics', 'Up to 10 tables'],
              tablesLimit: 10,
              isActive: true
            },
            {
              id: 'pro',
              name: 'Pro (Most Popular)',
              price: '₹2,999/mo',
              priceNumeric: 2999,
              desc: 'Unlimited tables, sound alerts, coupons & customer loyalty',
              features: ['Unlimited Tables', 'Sound Alerts', 'Coupons', 'Customer Loyalty', 'Advanced Analytics'],
              tablesLimit: -1,
              isActive: true
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: '₹5,999/mo',
              priceNumeric: 5999,
              desc: 'Multi-outlet chain management, custom domain & SLA',
              features: ['Multi-outlet Management', 'Custom Domain', 'SLA Support', 'Priority Support', 'API Access'],
              tablesLimit: -1,
              isActive: true
            }
          ];
          await SubscriptionPlanModel.insertMany(defaultPlans);
        }

        console.log('🌱 [MongoDB] Seeded initial restaurant data into MongoDB collections.');
        return { seeded: true, message: 'Seeded initial restaurant data into MongoDB.' };
      }
      return { seeded: false, message: 'Database already populated.' };
    } catch (err: any) {
      console.error('❌ [MongoDB] Error seeding data:', err);
      return { seeded: false, message: err.message };
    }
  } else {
    // Reset in-memory database
    if (force) {
      // Hash passwords for in-memory store
      const vendorsWithHashedPasswords = await Promise.all(
        initialVendors.map(async (vendor) => {
          if (vendor.password) {
            return {
              ...vendor,
              password: await hashPassword(vendor.password)
            };
          }
          return vendor;
        })
      );

      memoryDb.vendors = vendorsWithHashedPasswords;
      memoryDb.categories = [...initialCategories];
      memoryDb.products = [...initialProducts];
      memoryDb.orders = [...initialOrders];
      memoryDb.tables = [...initialTables];
      memoryDb.coupons = [...initialCoupons];
      memoryDb.customers = [...initialCustomers];
      return { seeded: true, message: 'Reset and seeded in-memory store.' };
    }
    return { seeded: false, message: 'In-memory store already populated.' };
  }
}

export async function getDbStatus(): Promise<DbStatusInfo> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || '';
  const uriPreview = uri
    ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
    : 'Not configured (using in-memory fallback)';

  let counts = {
    vendors: memoryDb.vendors.length,
    categories: memoryDb.categories.length,
    products: memoryDb.products.length,
    orders: memoryDb.orders.length,
    tables: memoryDb.tables.length,
    coupons: memoryDb.coupons.length,
    customers: memoryDb.customers.length,
    subscriptionPlans: memoryDb.subscriptionPlans.length
  };

  if (isMongoConnected) {
    try {
      const [vendors, categories, products, orders, tables, coupons, customers, subscriptionPlans] = await Promise.all([
        VendorModel.countDocuments(),
        CategoryModel.countDocuments(),
        ProductModel.countDocuments(),
        OrderModel.countDocuments(),
        TableModel.countDocuments(),
        CouponModel.countDocuments(),
        CustomerModel.countDocuments(),
        SubscriptionPlanModel.countDocuments()
      ]);
      counts = { vendors, categories, products, orders, tables, coupons, customers, subscriptionPlans };
    } catch {
      // ignore
    }
  }

  return {
    engine: isMongoConnected ? 'mongodb' : 'in_memory_fallback',
    isConnected: isMongoConnected,
    uriConfigured: Boolean(uri && uri.trim()),
    uriPreview,
    dbName: isMongoConnected ? (mongoose.connection?.name || 'dinesmart') : 'dinesmart_local',
    counts,
    lastSyncedAt: new Date().toISOString(),
    message: isMongoConnected
      ? 'Connected to live MongoDB cluster with active Mongoose models'
      : (connectionErrorMessage
        ? `MongoDB disconnected (${connectionErrorMessage}). Dynamic store running with Mongoose schema structures.`
        : 'Running in resilient dynamic store. Add MONGODB_URI to connect to external MongoDB cluster.')
  };
}

// -------------------------------------------------------------
// UNIFIED DATA SERVICE (Routes calls to MongoDB or Fallback Store)
// -------------------------------------------------------------

export const dbService = {
  // Vendors
  async getVendors() {
    if (isMongoConnected) {
      return await VendorModel.find({}).lean();
    }
    return memoryDb.vendors;
  },

  async getVendorById(id: string) {
    if (isMongoConnected) {
      return await VendorModel.findOne({ id }).lean();
    }
    return memoryDb.vendors.find(v => v.id === id) || null;
  },

  async createVendor(vendorData: any) {
    if (isMongoConnected) {
      const doc = await VendorModel.create(vendorData);
      return doc.toObject();
    }
    memoryDb.vendors.push(vendorData);
    return vendorData;
  },

  async updateVendor(id: string, updates: any) {
    if (isMongoConnected) {
      const updated = await VendorModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return updated;
    }
    const idx = memoryDb.vendors.findIndex(v => v.id === id);
    if (idx !== -1) {
      memoryDb.vendors[idx] = { ...memoryDb.vendors[idx], ...updates };
      return memoryDb.vendors[idx];
    }
    return null;
  },

  async deleteVendor(id: string) {
    if (isMongoConnected) {
      await VendorModel.deleteOne({ id });
      return true;
    }
    const idx = memoryDb.vendors.findIndex(v => v.id === id);
    if (idx !== -1) {
      memoryDb.vendors.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Categories
  async getCategories(vendorId?: string) {
    if (isMongoConnected) {
      const query = vendorId ? { vendorId } : {};
      return await CategoryModel.find(query).sort({ displayOrder: 1 }).lean();
    }
    if (vendorId) {
      return memoryDb.categories
        .filter(c => c.vendorId === vendorId)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return memoryDb.categories;
  },

  async getCategoryById(id: string) {
    if (isMongoConnected) {
      return await CategoryModel.findOne({ id }).lean();
    }
    return memoryDb.categories.find(c => c.id === id) || null;
  },

  async createCategory(catData: any) {
    if (isMongoConnected) {
      const doc = await CategoryModel.create(catData);
      return doc.toObject();
    }
    memoryDb.categories.push(catData);
    return catData;
  },

  async updateCategory(id: string, updates: any) {
    if (isMongoConnected) {
      return await CategoryModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    }
    const idx = memoryDb.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryDb.categories[idx] = { ...memoryDb.categories[idx], ...updates };
      return memoryDb.categories[idx];
    }
    return null;
  },

  async deleteCategory(id: string) {
    if (isMongoConnected) {
      await CategoryModel.deleteOne({ id });
      return true;
    }
    const idx = memoryDb.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryDb.categories.splice(idx, 1);
      return true;
    }
    return false;
  },

  async reorderCategories(vendorId: string, orderedIds: string[]) {
    if (isMongoConnected) {
      const operations = orderedIds.map((id, index) =>
        CategoryModel.updateOne({ id, vendorId }, { $set: { displayOrder: index + 1 } })
      );
      await Promise.all(operations);
      return await CategoryModel.find({ vendorId }).sort({ displayOrder: 1 }).lean();
    }

    orderedIds.forEach((id, index) => {
      const cat = memoryDb.categories.find(c => c.id === id && c.vendorId === vendorId);
      if (cat) cat.displayOrder = index + 1;
    });
    return memoryDb.categories
      .filter(c => c.vendorId === vendorId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },

  // Products
  async getProducts(filter: { vendorId?: string; categoryId?: string; search?: string; vegType?: string }) {
    if (isMongoConnected) {
      const query: any = {};
      if (filter.vendorId) query.vendorId = filter.vendorId;
      if (filter.categoryId) query.categoryId = filter.categoryId;
      if (filter.vegType && filter.vegType !== 'all') query.vegType = filter.vegType;
      if (filter.search) {
        query.$or = [
          { name: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } }
        ];
      }
      return await ProductModel.find(query).lean();
    }

    return memoryDb.products.filter(p => {
      if (filter.vendorId && p.vendorId !== filter.vendorId) return false;
      if (filter.categoryId && p.categoryId !== filter.categoryId) return false;
      if (filter.vegType && filter.vegType !== 'all' && p.vegType !== filter.vegType) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  },

  async getProductById(id: string) {
    if (isMongoConnected) {
      return await ProductModel.findOne({ id }).lean();
    }
    return memoryDb.products.find(p => p.id === id) || null;
  },

  async createProduct(productData: any) {
    if (isMongoConnected) {
      const doc = await ProductModel.create(productData);
      return doc.toObject();
    }
    memoryDb.products.push(productData);
    return productData;
  },

  async updateProduct(id: string, updates: any) {
    if (isMongoConnected) {
      return await ProductModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    }
    const idx = memoryDb.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.products[idx] = { ...memoryDb.products[idx], ...updates };
      return memoryDb.products[idx];
    }
    return null;
  },

  async deleteProduct(id: string) {
    if (isMongoConnected) {
      await ProductModel.deleteOne({ id });
      return true;
    }
    const idx = memoryDb.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.products.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Orders
  async getOrders(filter: { vendorId?: string; phone?: string; status?: string }) {
    if (isMongoConnected) {
      const query: any = {};
      if (filter.vendorId) query.vendorId = filter.vendorId;
      if (filter.phone) query.customerPhone = filter.phone;
      if (filter.status) query.orderStatus = filter.status;
      return await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    }

    return memoryDb.orders
      .filter(o => {
        if (filter.vendorId && o.vendorId !== filter.vendorId) return false;
        if (filter.phone && o.customerPhone !== filter.phone) return false;
        if (filter.status && o.orderStatus !== filter.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(id: string) {
    if (isMongoConnected) {
      return await OrderModel.findOne({ id }).lean();
    }
    return memoryDb.orders.find(o => o.id === id) || null;
  },

  async createOrder(orderData: any) {
    if (isMongoConnected) {
      const doc = await OrderModel.create(orderData);
      // Also update or create customer record
      await this.upsertCustomerFromOrder(orderData);
      return doc.toObject();
    }
    memoryDb.orders.unshift(orderData);
    await this.upsertCustomerFromOrder(orderData);
    return orderData;
  },

  async updateOrderStatus(id: string, status: string) {
    if (isMongoConnected) {
      return await OrderModel.findOneAndUpdate({ id }, { orderStatus: status }, { new: true }).lean();
    }
    const order = memoryDb.orders.find(o => o.id === id);
    if (order) {
      order.orderStatus = status as any;
      return order;
    }
    return null;
  },

  async addOrderReview(id: string, rating: number, comment: string) {
    const review = { rating, comment, createdAt: new Date().toISOString() };
    if (isMongoConnected) {
      return await OrderModel.findOneAndUpdate({ id }, { review }, { new: true }).lean();
    }
    const order = memoryDb.orders.find(o => o.id === id);
    if (order) {
      order.review = review;
      return order;
    }
    return null;
  },

  // Tables
  async getTables(vendorId?: string) {
    if (isMongoConnected) {
      const query = vendorId ? { vendorId } : {};
      return await TableModel.find(query).lean();
    }
    if (vendorId) {
      return memoryDb.tables.filter(t => t.vendorId === vendorId);
    }
    return memoryDb.tables;
  },

  async createTable(tableData: any) {
    if (isMongoConnected) {
      const doc = await TableModel.create(tableData);
      return doc.toObject();
    }
    memoryDb.tables.push(tableData);
    return tableData;
  },

  async deleteTable(id: string) {
    if (isMongoConnected) {
      await TableModel.deleteOne({ id });
      return true;
    }
    const idx = memoryDb.tables.findIndex(t => t.id === id);
    if (idx !== -1) {
      memoryDb.tables.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Coupons
  async getCoupons(vendorId?: string) {
    if (isMongoConnected) {
      const query = vendorId ? { vendorId } : {};
      return await CouponModel.find(query).lean();
    }
    if (vendorId) {
      return memoryDb.coupons.filter(c => c.vendorId === vendorId);
    }
    return memoryDb.coupons;
  },

  async createCoupon(couponData: any) {
    if (isMongoConnected) {
      const doc = await CouponModel.create(couponData);
      return doc.toObject();
    }
    memoryDb.coupons.push(couponData);
    return couponData;
  },

  async toggleCoupon(id: string) {
    if (isMongoConnected) {
      const coupon = await CouponModel.findOne({ id });
      if (coupon) {
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        return coupon.toObject();
      }
      return null;
    }
    const coupon = memoryDb.coupons.find(c => c.id === id);
    if (coupon) {
      coupon.isActive = !coupon.isActive;
      return coupon;
    }
    return null;
  },

  // Customers
  async getCustomers(vendorId?: string) {
    if (isMongoConnected) {
      const query = vendorId ? { vendorId } : {};
      return await CustomerModel.find(query).sort({ totalSpent: -1 }).lean();
    }
    if (vendorId) {
      return memoryDb.customers
        .filter(c => c.vendorId === vendorId)
        .sort((a, b) => b.totalSpent - a.totalSpent);
    }
    return memoryDb.customers;
  },

  async upsertCustomerFromOrder(order: any) {
    const { vendorId, customerName, customerPhone, total, items } = order;
    if (!customerPhone) return;

    const dishNames = (items || []).map((it: any) => it.product?.name).filter(Boolean);

    if (isMongoConnected) {
      try {
        const existing = await CustomerModel.findOne({ vendorId, phone: customerPhone });
        if (existing) {
          existing.ordersCount = (existing.ordersCount || 1) + 1;
          existing.totalOrders = existing.ordersCount;
          existing.totalSpent = (existing.totalSpent || 0) + total;
          existing.loyaltyPoints = (existing.loyaltyPoints || 0) + Math.floor(total * 0.05);
          existing.lastVisit = new Date().toISOString().split('T')[0];
          existing.lastVisited = existing.lastVisit;
          const mergedDishes = Array.from(new Set([...(existing.favoriteDishes || []), ...dishNames])).slice(0, 5);
          existing.favoriteDishes = mergedDishes;
          await existing.save();
        } else {
          await CustomerModel.create({
            id: `cust-${Date.now()}`,
            vendorId,
            name: customerName,
            phone: customerPhone,
            ordersCount: 1,
            totalOrders: 1,
            totalSpent: total,
            loyaltyPoints: Math.floor(total * 0.05),
            lastVisit: new Date().toISOString().split('T')[0],
            lastVisited: new Date().toISOString().split('T')[0],
            favoriteDishes: dishNames.slice(0, 5)
          });
        }
      } catch (err) {
        console.error('Error updating customer:', err);
      }
      return;
    }

    // In-memory customer update
    const existingIdx = memoryDb.customers.findIndex((c: Customer) => c.vendorId === vendorId && c.phone === customerPhone);
    if (existingIdx !== -1) {
      const cust = memoryDb.customers[existingIdx];
      cust.ordersCount = (cust.ordersCount || 1) + 1;
      cust.totalOrders = cust.ordersCount;
      cust.totalSpent = (cust.totalSpent || 0) + total;
      cust.loyaltyPoints = (cust.loyaltyPoints || 0) + Math.floor(total * 0.05);
      cust.lastVisit = new Date().toISOString().split('T')[0];
      cust.lastVisited = cust.lastVisit;
      cust.favoriteDishes = Array.from(new Set([...(cust.favoriteDishes || []), ...dishNames])).slice(0, 5);
    } else {
      memoryDb.customers.push({
        id: `cust-${Date.now()}`,
        vendorId,
        name: customerName,
        phone: customerPhone,
        ordersCount: 1,
        totalOrders: 1,
        totalSpent: total,
        loyaltyPoints: Math.floor(total * 0.05),
        lastVisit: new Date().toISOString().split('T')[0],
        lastVisited: new Date().toISOString().split('T')[0],
        favoriteDishes: dishNames.slice(0, 5)
      } as Customer);
    }
  },

  // Subscription Plans
  async getSubscriptionPlans() {
    if (isMongoConnected) {
      return await SubscriptionPlanModel.find({}).lean();
    }
    return memoryDb.subscriptionPlans;
  },

  async getActiveSubscriptionPlans() {
    if (isMongoConnected) {
      return await SubscriptionPlanModel.find({ isActive: true }).lean();
    }
    return memoryDb.subscriptionPlans.filter((plan: SubscriptionPlan) => plan.isActive);
  },

  async getSubscriptionPlanById(id: string) {
    if (isMongoConnected) {
      return await SubscriptionPlanModel.findOne({ id }).lean();
    }
    return memoryDb.subscriptionPlans.find((plan: SubscriptionPlan) => plan.id === id) || null;
  },

  async createSubscriptionPlan(planData: any) {
    if (isMongoConnected) {
      const doc = await SubscriptionPlanModel.create(planData);
      return doc.toObject();
    }
    memoryDb.subscriptionPlans.push(planData as SubscriptionPlan);
    return planData;
  },

  async updateSubscriptionPlan(id: string, updates: any) {
    if (isMongoConnected) {
      const updated = await SubscriptionPlanModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
      return updated;
    }
    const idx = memoryDb.subscriptionPlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.subscriptionPlans[idx] = { ...memoryDb.subscriptionPlans[idx], ...updates };
      return memoryDb.subscriptionPlans[idx];
    }
    return null;
  },

  async deleteSubscriptionPlan(id: string) {
    if (isMongoConnected) {
      await SubscriptionPlanModel.deleteOne({ id });
      return true;
    }
    const idx = memoryDb.subscriptionPlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDb.subscriptionPlans.splice(idx, 1);
      return true;
    }
    return false;
  },

  async setSubscriptionPlans(plans: any[]) {
    if (isMongoConnected) {
      await SubscriptionPlanModel.deleteMany({});
      const docs = await SubscriptionPlanModel.insertMany(plans);
      return docs.map(doc => doc.toObject());
    }
    memoryDb.subscriptionPlans = plans;
    return plans;
  }
};
