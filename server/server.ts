import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import apiRoutes from './routes.js';
import { initDatabase } from './db.js';

dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const server = createServer(app);

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://digital-menu-eight.vercel.app',
  'https://digital-menu.vercel.app',
  'https://digital-menu-front-end.vercel.app',
  'https://digital-menu-front-end-ashen.vercel.app',
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

// WebSocket Server for real-time order updates
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Map<WebSocket, string>(); // Map WebSocket to vendorId

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 [WebSocket] New client connected');
  
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'subscribe' && data.vendorId) {
        clients.set(ws, data.vendorId);
        console.log(`📡 [WebSocket] Client subscribed to vendor: ${data.vendorId}`);
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔌 [WebSocket] Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function to send updates to specific vendor clients
export function broadcastToVendor(vendorId: string, data: any) {
  const message = JSON.stringify(data);
  clients.forEach((clientVendorId, ws) => {
    if (clientVendorId === vendorId && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// For Vercel deployment - export the app
export default app;

// For local development - always start server
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Server] Node.js Express server running on http://0.0.0.0:${PORT}`);
  console.log(`🍃 [Database] MongoDB & REST API endpoints ready at http://0.0.0.0:${PORT}/api`);
  console.log(`🔌 [WebSocket] WebSocket server ready at ws://0.0.0.0:${PORT}/ws`);
});
