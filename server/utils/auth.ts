import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, role: string, vendorId?: string): string => {
  const payload: any = { userId, role };
  if (vendorId) {
    payload.vendorId = vendorId;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const PERMISSIONS = {
  // Admin permissions
  ADMIN_MANAGE_VENDORS: 'admin:manage_vendors',
  ADMIN_VIEW_ALL_DATA: 'admin:view_all_data',
  ADMIN_DELETE_DATA: 'admin:delete_data',
  
  // Vendor permissions
  VENDOR_MANAGE_MENU: 'vendor:manage_menu',
  VENDOR_MANAGE_ORDERS: 'vendor:manage_orders',
  VENDOR_MANAGE_CATEGORIES: 'vendor:manage_categories',
  VENDOR_MANAGE_TABLES: 'vendor:manage_tables',
  VENDOR_MANAGE_COUPONS: 'vendor:manage_coupons',
  VENDOR_VIEW_ANALYTICS: 'vendor:view_analytics',
  VENDOR_EDIT_RESTAURANT: 'vendor:edit_restaurant',
  VENDOR_MANAGE_KDS: 'vendor:manage_kds',
};

export const DEFAULT_VENDOR_PERMISSIONS = [
  PERMISSIONS.VENDOR_MANAGE_MENU,
  PERMISSIONS.VENDOR_MANAGE_ORDERS,
  PERMISSIONS.VENDOR_MANAGE_CATEGORIES,
  PERMISSIONS.VENDOR_MANAGE_TABLES,
  PERMISSIONS.VENDOR_MANAGE_COUPONS,
  PERMISSIONS.VENDOR_VIEW_ANALYTICS,
  PERMISSIONS.VENDOR_EDIT_RESTAURANT,
  PERMISSIONS.VENDOR_MANAGE_KDS,
];

export const DEFAULT_ADMIN_PERMISSIONS = [
  PERMISSIONS.ADMIN_MANAGE_VENDORS,
  PERMISSIONS.ADMIN_VIEW_ALL_DATA,
  PERMISSIONS.ADMIN_DELETE_DATA,
];
