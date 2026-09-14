import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Vendor,
  Category,
  Product,
  ComboItem,
  CartItem,
  Order,
  Coupon,
  Customer,
  TableItem,
  AppViewMode,
  Language,
  OrderStatus,
  StockStatus
} from '../types';
import { SubscriptionPlan } from '../data/subscriptionPlans';
import { soundManager } from '../utils/audio';
import { api, DbStatusData } from '../services/api';

interface AppContextType {
  // Navigation & View
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTableNumber: string;
  setActiveTableNumber: (tbl: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isTableModalOpen: boolean;
  setIsTableModalOpen: (open: boolean) => void;

  // Database / Server Status
  dbStatus: DbStatusData | null;
  isDbModalOpen: boolean;
  setIsDbModalOpen: (open: boolean) => void;
  refreshDbStatus: () => Promise<void>;
  reseedDatabase: (force?: boolean) => Promise<void>;

  // Vendors
  vendors: Vendor[];
  activeVendor: Vendor | null;
  setActiveVendorId: (id: string) => void;
  setActiveVendor: (vendorOrId: Vendor | string) => void;
  registerVendor: (newVendor: Omit<Vendor, 'id' | 'createdAt' | 'rating' | 'totalReviews'>) => Promise<Vendor>;
  updateVendorDetails: (updated: Partial<Vendor>) => Promise<void>;

  // Menu Categories & Products
  categories: Category[];
  products: Product[];
  combos: ComboItem[];
  addCategory: (name: string, iconName?: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (newOrder: Category[]) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id' | 'vendorId'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;
  updateProductStock: (id: string, status: StockStatus, count?: number) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, addonIds?: string[], instructions?: string, quantity?: number) => void;
  updateCartQuantity: (itemKey: string, delta: number) => void;
  removeFromCart: (itemKey: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isRedeemingPoints: boolean;
  setIsRedeemingPoints: (val: boolean) => void;
  cartTotals: {
    subtotal: number;
    discount: number;
    happyHourDiscount: number;
    pointsDiscount: number;
    gst: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
  };

  // Orders
  orders: Order[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    diningType: 'dine_in' | 'takeaway' | 'delivery';
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod: 'cash' | 'upi' | 'card';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrderReview: (orderId: string, rating: number, comment: string) => Promise<void>;

  // Tables & QR
  tables: TableItem[];
  addTable: (tableNumber: string, capacity: number) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;

  // Coupons
  coupons: Coupon[];
  addCoupon: (newCoupon: Omit<Coupon, 'id' | 'vendorId' | 'usageCount'>) => Promise<void>;
  toggleCouponActive: (couponId: string) => Promise<void>;

  // Customers & Loyalty
  customers: Customer[];

  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => Promise<void>;

  // Sound triggers
  soundAlertEnabled: boolean;
  setSoundAlertEnabled: (enabled: boolean) => void;

  // Loading state
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with fallbacks
  const [viewMode, setViewMode] = useState<AppViewMode>('customer');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTableNumber, setActiveTableNumber] = useState<string>('Table 4');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<DbStatusData | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('dinesmart_vendors');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeVendorId, setActiveVendorId] = useState<string>(() => {
    const saved = localStorage.getItem('dinesmart_activeVendorId');
    return saved || '';
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('dinesmart_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dinesmart_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [combos] = useState<ComboItem[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dinesmart_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dinesmart_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem('dinesmart_tables');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('dinesmart_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('dinesmart_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptionPlans, setSubscriptionPlansState] = useState<SubscriptionPlan[]>([]);

  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Sync to local storage as secondary cache
  useEffect(() => {
    localStorage.setItem('dinesmart_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('dinesmart_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dinesmart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dinesmart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dinesmart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dinesmart_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('dinesmart_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('dinesmart_customers', JSON.stringify(customers));
  }, [customers]);

  const activeVendor = vendors.find(v => v.id === activeVendorId) || vendors[0] || null;

  // Refresh DB Status from Express
  const refreshDbStatus = useCallback(async () => {
    try {
      const status = await api.getDbStatus();
      setDbStatus(status);
    } catch {
      // offline or server restarting
    }
  }, []);

  // Reseed Database
  const reseedDatabase = useCallback(async (force = true) => {
    const res = await api.seedDatabase(force);
    setDbStatus(res.status);
    // Reload all data
    await loadInitialData();
  }, []);

  // Load all data from Node.js Express server
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedStatus, fetchedVendors, fetchedCats, fetchedProds, fetchedOrds, fetchedTbls, fetchedCpns, fetchedCusts, fetchedPlans] =
        await Promise.allSettled([
          api.getDbStatus(),
          api.getVendors(),
          api.getCategories(),
          api.getProducts(),
          api.getOrders(),
          api.getTables(),
          api.getCoupons(),
          api.getCustomers(),
          api.getSubscriptionPlans()
        ]);

      if (fetchedStatus.status === 'fulfilled') setDbStatus(fetchedStatus.value);
      if (fetchedVendors.status === 'fulfilled' && fetchedVendors.value?.length > 0) {
        setVendors(fetchedVendors.value);
        // Set first vendor as active if no active vendor set
        if (!activeVendorId && fetchedVendors.value.length > 0) {
          setActiveVendorId(fetchedVendors.value[0].id);
        }
      }
      if (fetchedCats.status === 'fulfilled' && fetchedCats.value?.length > 0) setCategories(fetchedCats.value);
      if (fetchedProds.status === 'fulfilled' && fetchedProds.value?.length > 0) setProducts(fetchedProds.value);
      if (fetchedOrds.status === 'fulfilled' && fetchedOrds.value?.length > 0) setOrders(fetchedOrds.value);
      if (fetchedTbls.status === 'fulfilled' && fetchedTbls.value?.length > 0) setTables(fetchedTbls.value);
      if (fetchedCpns.status === 'fulfilled' && fetchedCpns.value?.length > 0) setCoupons(fetchedCpns.value);
      if (fetchedCusts.status === 'fulfilled' && fetchedCusts.value?.length > 0) setCustomers(fetchedCusts.value);
      if (fetchedPlans.status === 'fulfilled' && fetchedPlans.value?.length > 0) setSubscriptionPlansState(fetchedPlans.value);
    } catch (err) {
      console.warn('Initial server sync warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeVendorId]);

  // Fetch initial data on boot
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Periodic polling for live orders from Express server (real-time KDS & Live POS sync)
  const prevOrderCountRef = useRef(orders.length);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!activeVendor) return;
        const liveOrders = await api.getOrders({ vendorId: activeVendor.id });
        if (liveOrders && Array.isArray(liveOrders)) {
          setOrders(prev => {
            // Check if there are new orders to trigger sound
            if (liveOrders.length > prevOrderCountRef.current && soundAlertEnabled) {
              soundManager.playNewOrderDing();
            }
            prevOrderCountRef.current = liveOrders.length;
            return liveOrders;
          });
        }
      } catch {
        // Polling gracefully ignores transient errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeVendor, soundAlertEnabled]);

  const setActiveVendor = (vendorOrId: Vendor | string) => {
    const id = typeof vendorOrId === 'string' ? vendorOrId : vendorOrId.id;
    setActiveVendorId(id);
  };

  // Vendor registration
  const registerVendor = async (newVendorData: Omit<Vendor, 'id' | 'createdAt' | 'rating' | 'totalReviews'>) => {
    const id = `vendor-${Date.now().toString(36)}`;
    const newVendor: Vendor = {
      ...newVendorData,
      id,
      rating: 5.0,
      totalReviews: 1,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setVendors(prev => [newVendor, ...prev]);
    setActiveVendorId(id);
    setViewMode('vendor_dashboard');

    // Dynamic backend sync
    try {
      await api.createVendor(newVendor);
      refreshDbStatus();
    } catch (err) {
      console.error('Error saving vendor to backend:', err);
    }

    return newVendor;
  };

  const updateVendorDetails = async (updated: Partial<Vendor>) => {
    setVendors(prev =>
      prev.map(v => (v.id === activeVendor.id ? { ...v, ...updated } : v))
    );

    try {
      await api.updateVendor(activeVendor.id, updated);
      refreshDbStatus();
    } catch (err) {
      console.error('Error updating vendor:', err);
    }
  };

  // Category management
  const addCategory = async (name: string, iconName = 'Utensils') => {
    const newCat: Category = {
      id: `cat-${Date.now().toString(36)}`,
      vendorId: activeVendor.id,
      name,
      iconName,
      displayOrder: categories.length + 1,
      isActive: true
    };

    setCategories(prev => [...prev, newCat]);

    try {
      await api.createCategory(newCat);
      refreshDbStatus();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    try {
      await api.deleteCategory(categoryId);
      refreshDbStatus();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const reorderCategories = async (newOrder: Category[]) => {
    setCategories(newOrder);
    try {
      await api.reorderCategories(activeVendor.id, newOrder.map(c => c.id));
    } catch (err) {
      console.error('Error reordering categories:', err);
    }
  };

  // Product management
  const addProduct = async (newProdData: Omit<Product, 'id' | 'vendorId'>) => {
    const newProd: Product = {
      ...newProdData,
      id: `prod-${Date.now().toString(36)}`,
      vendorId: activeVendor.id
    };

    setProducts(prev => [newProd, ...prev]);

    try {
      await api.createProduct(newProd);
      refreshDbStatus();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await api.updateProduct(id, updates);
      refreshDbStatus();
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
    try {
      await api.deleteProduct(id);
      refreshDbStatus();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const toggleProductAvailability = async (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
    try {
      await api.toggleProductAvailability(id);
      refreshDbStatus();
    } catch (err) {
      console.error('Error toggling product:', err);
    }
  };

  const updateProductStock = async (id: string, stockStatus: StockStatus, count?: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              stockStatus,
              stockCount: count !== undefined ? count : p.stockCount,
              isAvailable: stockStatus !== 'out_of_stock'
            }
          : p
      )
    );
    try {
      await api.updateProductStock(id, stockStatus, count);
      refreshDbStatus();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  // Cart operations
  const addToCart = (
    product: Product,
    variantId?: string,
    addonIds: string[] = [],
    instructions = '',
    quantity = 1
  ) => {
    soundManager.playCartPop();
    const selectedVariant = product.variants?.find(v => v.id === variantId);
    const selectedAddons = product.addons?.filter(a => addonIds.includes(a.id)) || [];

    const basePrice = product.price;
    const variantExtra = selectedVariant ? selectedVariant.priceDiff : 0;
    const addonsExtra = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + variantExtra + addonsExtra;

    const itemKey = `${product.id}-${variantId || 'base'}-${addonIds.sort().join('_')}-${instructions}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.itemKey === itemKey);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + quantity
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            itemKey,
            product,
            quantity,
            selectedVariant,
            selectedAddons,
            specialInstructions: instructions,
            itemPrice: unitPrice
          }
        ];
      }
    });
  };

  const updateCartQuantity = (itemKey: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.itemKey === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (itemKey: string) => {
    setCart(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setIsRedeemingPoints(false);
  };

  // Coupon application
  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
    if (subtotal < found.minPurchase) {
      return {
        success: false,
        message: `Minimum purchase of ${activeVendor?.currency || '$'}${found.minPurchase} required for this coupon.`
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Cart totals calculation
  const isHappyHourActive = () => {
    if (!activeVendor || !activeVendor.happyHourEnabled) return false;
    const now = new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;
    const [startH, startM] = activeVendor.happyHourStart.split(':').map(Number);
    const [endH, endM] = activeVendor.happyHourEnd.split(':').map(Number);
    const startVal = startH + (startM || 0) / 60;
    const endVal = endH + (endM || 0) / 60;
    return currentHours >= startVal && currentHours <= endVal;
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
    let discount = 0;
    let happyHourDiscount = 0;

    if (activeVendor && isHappyHourActive()) {
      happyHourDiscount = (subtotal * (activeVendor.happyHourDiscount || 0)) / 100;
    }

    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'flat') {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === 'percentage') {
        const rawDisc = (subtotal * appliedCoupon.value) / 100;
        discount = appliedCoupon.maxDiscount ? Math.min(rawDisc, appliedCoupon.maxDiscount) : rawDisc;
      }
    }

    let pointsDiscount = 0;
    if (isRedeemingPoints) {
      pointsDiscount = Math.min(subtotal * 0.5, 50);
    }

    const netTaxable = Math.max(0, subtotal - discount - happyHourDiscount - pointsDiscount);
    const gst = Math.round(netTaxable * 0.05 * 100) / 100;
    const deliveryFee = 0;
    const total = Math.max(0, Math.round((netTaxable + gst + deliveryFee) * 100) / 100);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      discount,
      happyHourDiscount,
      pointsDiscount,
      gst,
      deliveryFee,
      total,
      itemCount
    };
  };

  const cartTotals = calculateTotals();

  // Orders creation and tracking
  const placeOrder = async (details: {
    customerName: string;
    customerPhone: string;
    diningType: 'dine_in' | 'takeaway' | 'delivery';
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod: 'cash' | 'upi' | 'card';
  }): Promise<Order> => {
    const orderNum = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now().toString(36)}`,
      orderNumber: orderNum,
      vendorId: activeVendor.id,
      customerName: details.customerName || 'Valued Guest',
      customerPhone: details.customerPhone,
      diningType: details.diningType,
      tableNumber: details.diningType === 'dine_in' ? details.tableNumber || activeTableNumber : undefined,
      deliveryAddress: details.diningType === 'delivery' ? details.deliveryAddress : undefined,
      notes: details.notes,
      items: [...cart],
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discount + cartTotals.happyHourDiscount + cartTotals.pointsDiscount,
      gst: cartTotals.gst,
      deliveryFee: cartTotals.deliveryFee,
      total: cartTotals.total,
      paymentMethod: details.paymentMethod,
      paymentStatus: details.paymentMethod === 'cash' ? 'pending' : 'paid',
      orderStatus: 'received',
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: 18,
      appliedCouponCode: appliedCoupon ? appliedCoupon.code : undefined
    };

    // Optimistic UI update
    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingOrderId(newOrder.id);

    if (soundAlertEnabled) {
      soundManager.playNewOrderDing();
    }

    clearCart();

    // Dynamic backend sync to Node.js Express & MongoDB
    try {
      const created = await api.createOrder(newOrder);
      if (created?.id) {
        setActiveTrackingOrderId(created.id);
      }
      refreshDbStatus();
      // Reload customers as order automatically awards points
      const updatedCustomers = await api.getCustomers(activeVendor.id);
      if (updatedCustomers?.length) setCustomers(updatedCustomers);
    } catch (err) {
      console.error('Error placing order to backend:', err);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, orderStatus: status } : ord))
    );
    if (soundAlertEnabled) {
      soundManager.playKitchenBump();
    }

    try {
      await api.updateOrderStatus(orderId, status);
      refreshDbStatus();
    } catch (err) {
      console.error('Error updating order status in backend:', err);
    }
  };

  const addOrderReview = async (orderId: string, rating: number, comment: string) => {
    setOrders(prev =>
      prev.map(ord =>
        ord.id === orderId
          ? {
              ...ord,
              review: {
                rating,
                comment,
                createdAt: new Date().toISOString()
              }
            }
          : ord
      )
    );

    try {
      await api.addOrderReview(orderId, rating, comment);
      refreshDbStatus();
    } catch (err) {
      console.error('Error adding review in backend:', err);
    }
  };

  // Tables
  const addTable = async (tableNumber: string, capacity: number) => {
    const newTbl: TableItem = {
      id: `tbl-${Date.now().toString(36)}`,
      vendorId: activeVendor.id,
      tableNumber,
      capacity,
      status: 'available'
    };
    setTables(prev => [...prev, newTbl]);

    try {
      await api.createTable(newTbl);
      refreshDbStatus();
    } catch (err) {
      console.error('Error adding table:', err);
    }
  };

  const deleteTable = async (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    try {
      await api.deleteTable(id);
      refreshDbStatus();
    } catch (err) {
      console.error('Error deleting table:', err);
    }
  };

  // Coupons
  const addCoupon = async (newCouponData: Omit<Coupon, 'id' | 'vendorId' | 'usageCount'>) => {
    const newC: Coupon = {
      ...newCouponData,
      id: `coup-${Date.now().toString(36)}`,
      vendorId: activeVendor.id,
      usageCount: 0
    };
    setCoupons(prev => [newC, ...prev]);

    try {
      await api.createCoupon(newC);
      refreshDbStatus();
    } catch (err) {
      console.error('Error adding coupon:', err);
    }
  };

  const toggleCouponActive = async (couponId: string) => {
    setCoupons(prev =>
      prev.map(c => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
    try {
      await api.toggleCoupon(couponId);
      refreshDbStatus();
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  // Subscription Plans
  const setSubscriptionPlans = async (plans: SubscriptionPlan[]) => {
    setSubscriptionPlansState(plans);
    try {
      await api.setSubscriptionPlans(plans);
      refreshDbStatus();
    } catch (err) {
      console.error('Error saving subscription plans:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        viewMode,
        setViewMode,
        language,
        setLanguage,
        activeTableNumber,
        setActiveTableNumber,
        isCartOpen,
        setIsCartOpen,
        isTableModalOpen,
        setIsTableModalOpen,
        dbStatus,
        isDbModalOpen,
        setIsDbModalOpen,
        refreshDbStatus,
        reseedDatabase,
        vendors,
        activeVendor: activeVendor || (vendors[0] || null),
        setActiveVendorId,
        setActiveVendor,
        registerVendor,
        updateVendorDetails,
        categories: activeVendor ? categories.filter(c => c.vendorId === activeVendor.id) : [],
        products: activeVendor ? products.filter(p => p.vendorId === activeVendor.id) : [],
        combos: activeVendor ? combos.filter(c => c.vendorId === activeVendor.id) : [],
        addCategory,
        deleteCategory,
        reorderCategories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        updateProductStock,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        isRedeemingPoints,
        setIsRedeemingPoints,
        cartTotals,
        orders: activeVendor ? orders.filter(o => o.vendorId === activeVendor.id) : [],
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        placeOrder,
        updateOrderStatus,
        addOrderReview,
        tables: activeVendor ? tables.filter(t => t.vendorId === activeVendor.id) : [],
        addTable,
        deleteTable,
        coupons: activeVendor ? coupons.filter(c => c.vendorId === activeVendor.id) : [],
        addCoupon,
        toggleCouponActive,
        customers: activeVendor ? customers.filter(c => c.vendorId === activeVendor.id) : [],
        subscriptionPlans,
        setSubscriptionPlans,
        soundAlertEnabled,
        setSoundAlertEnabled,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
