import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Order, OrderStatus } from '../../../types';
import {
  ChefHat,
  Clock,
  Check,
  BellRing,
  AlertCircle,
  Volume2,
  Maximize2
} from 'lucide-react';

export const KitchenDisplayTab: React.FC = () => {
  const { orders, updateOrderStatus, activeVendor } = useApp();

  // Elapsed timer tick state for live time computation
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter only active orders needing kitchen attention: 'received' and 'preparing'
  const kitchenOrders = orders.filter(
    o => o.orderStatus === 'received' || o.orderStatus === 'preparing' || o.orderStatus === 'ready'
  );

  // Helper to compute minutes elapsed since creation
  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[82vh] rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl border border-slate-800">
      {/* KDS Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-600/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-xl text-white tracking-tight">
                Kitchen Display System (KDS)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeVendor.name} • Stations Bump Bar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Active Kitchen Orders</div>
            <div className="font-heading font-extrabold text-lg text-orange-400">
              {kitchenOrders.length} tickets
            </div>
          </div>
        </div>
      </div>

      {/* Large Kitchen Tickets Cards Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="py-24 text-center space-y-2">
          <ChefHat className="w-16 h-16 text-slate-700 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-slate-300">
            Kitchen Rail is Clear
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All orders have been prepared and served. New customer QR orders will flash on this screen with audio notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kitchenOrders.map(order => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isDelayed = elapsed >= 15;
            const isWarning = elapsed >= 10 && elapsed < 15;

            return (
              <div
                key={order.id}
                className={`bg-slate-900 rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                  isDelayed
                    ? 'border-rose-500/80 bg-rose-950/20 ring-2 ring-rose-500/40'
                    : isWarning
                    ? 'border-amber-500/80 bg-amber-950/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Header Ticket Information */}
                <div
                  className={`p-3.5 flex items-center justify-between border-b ${
                    isDelayed
                      ? 'bg-rose-950/60 border-rose-900/60 text-rose-200'
                      : isWarning
                      ? 'bg-amber-950/60 border-amber-900/60 text-amber-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-lg text-white">
                      #{order.orderNumber}
                    </span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-white/10 uppercase">
                      {order.diningType === 'dine_in'
                        ? order.tableNumber || 'Table'
                        : order.diningType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}m ago</span>
                  </div>
                </div>

                {/* Items Checklist for Chefs */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="divide-y divide-slate-800">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <div className="font-heading font-bold text-sm text-white leading-tight">
                              {item.product.name}
                            </div>
                            {item.selectedVariant && (
                              <div className="text-xs text-orange-300 font-semibold mt-0.5">
                                • {item.selectedVariant.name}
                              </div>
                            )}
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <div className="text-xs text-slate-400">
                                + {item.selectedAddons.map(a => a.name).join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded mt-1">
                                NOTE: &quot;{item.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300">
                      <span className="font-bold">GUEST INSTRUCTION:</span> {order.notes}
                    </div>
                  )}
                </div>

                {/* Bump Bar Actions */}
                <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                  {order.orderStatus === 'received' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <ChefHat className="w-5 h-5" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {order.orderStatus === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <BellRing className="w-5 h-5" />
                      <span>Ready to Plate</span>
                    </button>
                  )}

                  {order.orderStatus === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Served (Bump Off)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
