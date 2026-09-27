import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import apiRoutes from '../routes.js';
import { initDatabase } from '../db.js';

dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'https://digital-menu-eight.vercel.app',
  'https://digital-menu.vercel.app',
  'https://digital-menu-front-end.vercel.app',
  'https://digital-menu-front-end-ashen.vercel.app',
  'https://digital-menu-backend.vercel.app',
  process.env.CLIENT_URL || process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize database connection asynchronously without blocking server readiness
initDatabase().catch(err => {
  console.warn('Database initialization warning:', err);
});

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch-all for undefined routes - return JSON error
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler - ensure JSON responses
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message || 'An unexpected error occurred' 
  });
});

// Broadcast function stub for Vercel (WebSockets not supported in serverless)
export function broadcastToVendor(vendorId: string, data: any) {
  // No-op for Vercel serverless deployment
  // In production, this would use a real-time service like Pusher, Ably, etc.
  console.log(`[Broadcast] Would send to vendor ${vendorId}:`, data);
}

// For Vercel deployment - export the app
export default app;
