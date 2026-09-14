import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Order, OrderStatus } from '../../../types';
import {
  Clock,
  Printer,
  CheckCircle2,
  XCircle,
  ChefHat,
  BellRing,
  ShoppingBag,
  Search,
  Receipt,
  User,
  Phone,
  Table,
  Sparkles
} from 'lucide-react';

export const OrdersTab: React.FC = () => {
  const { orders, updateOrderStatus, activeVendor } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.orderStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'preparing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Live Restaurant Orders
          </h2>
          <p className="text-xs text-slate-500">
            Real-time incoming orders with instant kitchen dispatch and status tracking.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order #, phone, name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          {
            id: 'received',
            label: 'New Incoming',
            count: orders.filter(o => o.orderStatus === 'received').length
          },
          {
            id: 'preparing',
            label: 'Preparing',
            count: orders.filter(o => o.orderStatus === 'preparing').length
          },
          {
            id: 'ready',
            label: 'Ready to Serve',
            count: orders.filter(o => o.orderStatus === 'ready').length
          },
          {
            id: 'completed',
            label: 'Completed',
            count: orders.filter(o => o.orderStatus === 'completed').length
          }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-slate-800 text-sm">No orders in this view</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming orders will appear here automatically with live audio alerts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                order.orderStatus === 'received'
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-slate-900 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-semibold text-slate-900">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-orange-600">
                    <Table className="w-3.5 h-3.5" />
                    <span>
                      {order.diningType === 'dine_in'
                        ? order.tableNumber || 'Table'
                        : order.diningType.toUpperCase()}
                    </span>
                  </div>
                </div>

                {order.customerPhone && (
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-slate-900">
                        {item.quantity}x {item.product.name}
                      </div>
                      {item.selectedVariant && (
                        <div className="text-[11px] text-slate-500">
                          Size: {item.selectedVariant.name}
                        </div>
                      )}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-[11px] text-slate-500">
                          Addons: {item.selectedAddons.map(a => a.name).join(', ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 italic">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-slate-700">
                      {activeVendor.currency}
                      {(item.itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes if any */}
              {order.notes && (
                <div className="px-4 py-1.5 bg-amber-50/70 border-t border-amber-100 text-[11px] text-amber-900">
                  <span className="font-bold">Customer Note:</span> {order.notes}
                </div>
              )}

              {/* Card Footer with Bill & Status Progression Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 uppercase font-semibold text-[10px]">
                    {order.paymentMethod} • {order.paymentStatus}
                  </span>
                  <span className="font-heading font-extrabold text-sm text-slate-900">
                    Total: {activeVendor.currency}
                    {order.total.toFixed(2)}
                  </span>
                </div>

                {/* Status progression action buttons */}
                <div className="flex items-center gap-1.5">
                  {order.orderStatus === 'received' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accept & Cook</span>
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Reject Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {order.orderStatus === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {order.orderStatus === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Served & Paid</span>
                    </button>
                  )}

                  {order.orderStatus === 'completed' && (
                    <div className="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                      ✓ Order Completed
                    </div>
                  )}

                  {/* Print Button */}
                  <button
                    onClick={() => setPrintingOrder(order)}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Print KOT / Bill"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print KOT / Bill Thermal Receipt Modal */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 printable-area">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-heading font-extrabold text-base text-slate-900 uppercase">
                {activeVendor.name}
              </h3>
              <p className="text-[11px] text-slate-500">{activeVendor.address}</p>
              <p className="text-[11px] text-slate-500">GSTIN: {activeVendor.gstNumber}</p>
              <div className="mt-2 text-xs font-bold text-slate-900">
                KITCHEN ORDER TICKET (KOT)
              </div>
            </div>

            <div className="text-xs space-y-1 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Order No:</span>
                <span className="font-bold">#{printingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Dining:</span>
                <span className="font-bold">
                  {printingOrder.diningType === 'dine_in'
                    ? printingOrder.tableNumber
                    : printingOrder.diningType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{printingOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date(printingOrder.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-300">
              {printingOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-semibold">
                    {activeVendor.currency}
                    {(item.itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1 pb-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {activeVendor.currency}
                  {printingOrder.subtotal.toFixed(2)}
                </span>
              </div>
              {printingOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>
                    -{activeVendor.currency}
                    {printingOrder.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>
                  {activeVendor.currency}
                  {printingOrder.gst.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL DUE</span>
                <span>
                  {activeVendor.currency}
                  {printingOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="no-print pt-2 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
              >
                Print Slip
              </button>
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
