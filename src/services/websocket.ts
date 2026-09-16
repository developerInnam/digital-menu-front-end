import { Order } from '../types';

export type WebSocketMessage = {
  type: 'new_order' | 'order_status_update';
  order: Order;
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private vendorId: string | null = null;

  connect(vendorId: string) {
    if (this.ws?.readyState === WebSocket.OPEN && this.vendorId === vendorId) {
      return; // Already connected to the correct vendor
    }

    this.vendorId = vendorId;
    this.disconnect();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost:3000'
      : window.location.host;
    
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log(`🔌 [WebSocket] Connecting to ${wsUrl}`);
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ [WebSocket] Connected');
      this.reconnectAttempts = 0;
      
      // Subscribe to vendor orders
      if (this.ws && this.vendorId) {
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          vendorId: this.vendorId
        }));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('📡 [WebSocket] Received:', message);
        this.messageHandlers.forEach(handler => handler(message));
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ [WebSocket] Error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 [WebSocket] Disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 [WebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.vendorId) {
          this.connect(this.vendorId);
        }
      }, this.reconnectDelay);
    } else {
      console.error('❌ [WebSocket] Max reconnection attempts reached');
    }
  }

  onMessage(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
