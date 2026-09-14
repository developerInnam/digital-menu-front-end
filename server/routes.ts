import { Router, Request, Response } from 'express';
import { dbService, getDbStatus, seedDatabaseIfEmpty } from './db.js';
import { hashPassword, comparePassword, generateToken, verifyToken, DEFAULT_VENDOR_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS } from './utils/auth.js';
import { authenticate, authorize, AuthRequest } from './middleware/auth.js';

const router = Router();

// -------------------------------------------------------------
// SYSTEM & DATABASE STATUS
// -------------------------------------------------------------

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get(['/db/status', '/db-status'], async (req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/db/seed', async (req: Request, res: Response) => {
  try {
    const force = req.body?.force === true;
    const result = await seedDatabaseIfEmpty(force);
    const status = await getDbStatus();
    res.json({ ...result, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/platform-stats', async (req: Request, res: Response) => {
  try {
    const orders = await dbService.getOrders({});
    const totalScans = orders.length;
    const uptime = process.uptime();
    const uptimePercent = 99.98;
    
    res.json({
      totalDinerScans: totalScans,
      systemUptime: uptimePercent,
      uptimeSeconds: uptime
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------

// Login endpoint
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const vendors = await dbService.getVendors();
    const vendor = vendors.find((v: any) => v.email === email);

    if (!vendor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!vendor.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isPasswordValid = await comparePassword(password, vendor.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(vendor.id, vendor.role, vendor.id);

    res.json({
      token,
      user: {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role,
        slug: vendor.slug,
        permissions: vendor.permissions || (vendor.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_VENDOR_PERMISSIONS)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register endpoint (for admin to create vendors)
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, ...vendorData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const vendors = await dbService.getVendors();
    const existingVendor = vendors.find((v: any) => v.email === email);

    if (existingVendor) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const newVendor = {
      ...vendorData,
      email,
      password: hashedPassword,
      role: role || 'vendor',
      permissions: role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_VENDOR_PERMISSIONS,
      isActive: true
    };

    const createdVendor = await dbService.createVendor(newVendor);

    const token = generateToken(createdVendor.id, createdVendor.role, createdVendor.id);

    res.status(201).json({
      token,
      user: {
        id: createdVendor.id,
        email: createdVendor.email,
        name: createdVendor.name,
        role: createdVendor.role,
        slug: createdVendor.slug,
        permissions: createdVendor.permissions
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token endpoint
router.get('/auth/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const vendors = await dbService.getVendors();
    const vendor = vendors.find((v: any) => v.id === decoded.userId);

    if (!vendor || !vendor.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    res.json({
      valid: true,
      user: {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role,
        slug: vendor.slug,
        permissions: vendor.permissions
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VENDORS
// -------------------------------------------------------------

// Get vendor by slug - Public for customer menu access
router.get('/vendors/by-slug/:slug', async (req: Request, res: Response) => {
  try {
    const vendors = await dbService.getVendors();
    const vendor = vendors.find(v => v.slug === req.params.slug);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    const { password, ...vendorWithoutPassword } = vendor;
    res.json(vendorWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vendors - Public (for landing page)
router.get('/vendors', async (req: Request, res: Response) => {
  try {
    const vendors = await dbService.getVendors();
    // Remove passwords from response
    const vendorsWithoutPasswords = vendors.map((v: any) => {
      const { password, ...vendorWithoutPassword } = v;
      return vendorWithoutPassword;
    });
    res.json(vendorsWithoutPasswords);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get vendor by ID - Admin or own vendor
router.get('/vendors/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await dbService.getVendorById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    // Only allow admin or the vendor themselves to view
    if (req.user!.role !== 'admin' && req.user!.userId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { password, ...vendorWithoutPassword } = vendor;
    res.json(vendorWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create vendor - Admin only
router.post('/vendors', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.name) return res.status(400).json({ error: 'Vendor name is required' });
    if (!data.email || !data.password) return res.status(400).json({ error: 'Email and password are required' });

    const id = data.id || `vendor-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Hash password before creating
    const hashedPassword = await hashPassword(data.password);
    
    const newVendor = {
      ...data,
      id,
      slug,
      password: hashedPassword,
      role: data.role || 'vendor',
      permissions: data.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_VENDOR_PERMISSIONS,
      isActive: true
    };

    const created = await dbService.createVendor(newVendor);
    const { password, ...createdWithoutPassword } = created;
    res.status(201).json(createdWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update vendor - Admin or own vendor
router.put('/vendors/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Only allow admin or the vendor themselves to update
    if (req.user!.role !== 'admin' && req.user!.userId !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If updating password, hash it
    if (req.body.password) {
      req.body.password = await hashPassword(req.body.password);
    }

    const updated = await dbService.updateVendor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Vendor not found' });

    const { password, ...updatedWithoutPassword } = updated;
    res.json(updatedWithoutPassword);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vendor - Admin only
router.delete('/vendors/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const success = await dbService.deleteVendor(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------

// GET categories - Public (for customer menu)
router.get('/categories', async (req: any, res: Response) => {
  try {
    let vendorId = req.query.vendorId as string | undefined;
    const categories = await dbService.getCategories(vendorId);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.vendorId) {
      return res.status(400).json({ error: 'name and vendorId are required' });
    }

    // Vendors can only create categories for their own vendor
    if (req.user!.role !== 'admin' && data.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const id = data.id || `cat-${Date.now()}`;
    const created = await dbService.createCategory({ ...data, id });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const category = await dbService.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Vendors can only update their own categories
    if (req.user!.role !== 'admin' && category.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await dbService.updateCategory(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const category = await dbService.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Vendors can only delete their own categories
    if (req.user!.role !== 'admin' && category.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const success = await dbService.deleteCategory(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories/reorder', async (req: Request, res: Response) => {
  try {
    const { vendorId, orderedIds } = req.body;
    if (!vendorId || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'vendorId and orderedIds array are required' });
    }
    const reordered = await dbService.reorderCategories(vendorId, orderedIds);
    res.json(reordered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PRODUCTS / DISHES
// -------------------------------------------------------------

router.get('/products', async (req: Request, res: Response) => {
  try {
    const { vendorId, categoryId, search, vegType } = req.query;
    const products = await dbService.getProducts({
      vendorId: vendorId as string,
      categoryId: categoryId as string,
      search: search as string,
      vegType: vegType as string
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.vendorId || data.price === undefined) {
      return res.status(400).json({ error: 'name, vendorId, and price are required' });
    }

    // Vendors can only create products for their own vendor
    if (req.user!.role !== 'admin' && data.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const id = data.id || `prod-${Date.now()}`;
    const created = await dbService.createProduct({ ...data, id });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Vendors can only update their own products
    if (req.user!.role !== 'admin' && product.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await dbService.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/products/:id/stock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Vendors can only update their own products
    if (req.user!.role !== 'admin' && product.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { stockStatus, stockCount } = req.body;
    const updates: any = {};
    if (stockStatus) updates.stockStatus = stockStatus;
    if (stockCount !== undefined) updates.stockCount = stockCount;
    if (stockStatus === 'out_of_stock') updates.isAvailable = false;
    else if (stockStatus === 'in_stock') updates.isAvailable = true;

    const updated = await dbService.updateProduct(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/products/:id/toggle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const prod = await dbService.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    // Vendors can only update their own products
    if (req.user!.role !== 'admin' && prod.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isAvailable = !prod.isAvailable;
    const stockStatus = isAvailable ? 'in_stock' : 'out_of_stock';
    const updated = await dbService.updateProduct(req.params.id, { isAvailable, stockStatus });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Vendors can only delete their own products
    if (req.user!.role !== 'admin' && product.vendorId !== req.user!.vendorId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const success = await dbService.deleteProduct(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------

router.get('/orders', async (req: Request, res: Response) => {
  try {
    const { vendorId, phone, status } = req.query;
    const orders = await dbService.getOrders({
      vendorId: vendorId as string,
      phone: phone as string,
      status: status as string
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendorId || !data.customerName || !data.customerPhone || !Array.isArray(data.items)) {
      return res.status(400).json({ error: 'vendorId, customerName, customerPhone, and items array are required' });
    }

    const orderNumber = data.orderNumber || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = data.id || `ord-${Date.now()}`;
    const createdAt = data.createdAt || new Date().toISOString();

    const newOrder = {
      ...data,
      id,
      orderNumber,
      createdAt,
      orderStatus: data.orderStatus || 'received'
    };

    const created = await dbService.createOrder(newOrder);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const updated = await dbService.updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders/:id/review', async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (rating === undefined) return res.status(400).json({ error: 'rating is required' });
    const updated = await dbService.addOrderReview(req.params.id, Number(rating), comment || '');
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// TABLES & QR
// -------------------------------------------------------------

router.get('/tables', async (req: Request, res: Response) => {
  try {
    const vendorId = req.query.vendorId as string | undefined;
    const tables = await dbService.getTables(vendorId);
    res.json(tables);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tables', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendorId || !data.tableNumber) {
      return res.status(400).json({ error: 'vendorId and tableNumber are required' });
    }
    const id = data.id || `tbl-${Date.now()}`;
    const created = await dbService.createTable({ ...data, id, status: data.status || 'available' });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tables/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteTable(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// COUPONS
// -------------------------------------------------------------

router.get('/coupons', async (req: Request, res: Response) => {
  try {
    const vendorId = req.query.vendorId as string | undefined;
    const coupons = await dbService.getCoupons(vendorId);
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendorId || !data.code || data.discountValue === undefined) {
      return res.status(400).json({ error: 'vendorId, code, and discountValue are required' });
    }
    const id = data.id || `cpn-${Date.now()}`;
    const created = await dbService.createCoupon({ ...data, id, usageCount: 0 });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/coupons/:id/toggle', async (req: Request, res: Response) => {
  try {
    const toggled = await dbService.toggleCoupon(req.params.id);
    if (!toggled) return res.status(404).json({ error: 'Coupon not found' });
    res.json(toggled);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CUSTOMERS & LOYALTY
// -------------------------------------------------------------

router.get('/customers', async (req: Request, res: Response) => {
  try {
    const vendorId = req.query.vendorId as string | undefined;
    const customers = await dbService.getCustomers(vendorId);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/customers', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.vendorId || !data.name || !data.phone) {
      return res.status(400).json({ error: 'vendorId, name, and phone are required' });
    }
    await dbService.upsertCustomerFromOrder({
      vendorId: data.vendorId,
      customerName: data.name,
      customerPhone: data.phone,
      total: data.totalSpent || 0,
      items: []
    });
    const customers = await dbService.getCustomers(data.vendorId);
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SUBSCRIPTION PLANS
// -------------------------------------------------------------

router.get('/subscription-plans', async (req: Request, res: Response) => {
  try {
    const plans = await dbService.getSubscriptionPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subscription-plans/active', async (req: Request, res: Response) => {
  try {
    const plans = await dbService.getActiveSubscriptionPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subscription-plans/:id', async (req: Request, res: Response) => {
  try {
    const plan = await dbService.getSubscriptionPlanById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Subscription plan not found' });
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subscription-plans', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.price || !data.desc) {
      return res.status(400).json({ error: 'name, price, and desc are required' });
    }
    const id = data.id || data.name.toLowerCase().replace(/\s+/g, '-');
    const created = await dbService.createSubscriptionPlan({ ...data, id });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subscription-plans/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbService.updateSubscriptionPlan(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Subscription plan not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subscription-plans/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteSubscriptionPlan(req.params.id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subscription-plans', async (req: Request, res: Response) => {
  try {
    const { plans } = req.body;
    if (!Array.isArray(plans)) {
      return res.status(400).json({ error: 'plans array is required' });
    }
    const updated = await dbService.setSubscriptionPlans(plans);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
