import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    vendorId?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      vendorId: decoded.vendorId
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Admins have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // For vendors, we need to check their permissions from the database
      // This would require fetching the vendor record
      // For now, we'll skip this check and implement it when we have the vendor data in req
      next();
    } catch (error) {
      res.status(403).json({ error: 'Permission check failed' });
    }
  };
};
