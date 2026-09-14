import React from 'react';
import { useApp } from '../../../context/AppContext';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  ArrowUpRight,
  Plus,
  QrCode,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface OverviewAnalyticsTabProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewItemModal: () => void;
  onOpenNewCategoryModal: () => void;
}

export const OverviewAnalyticsTab: React.FC<OverviewAnalyticsTabProps> = ({
  onNavigateTab,
  onOpenNewItemModal,
  onOpenNewCategoryModal
}) => {
  const { activeVendor, orders, products, categories, customers } = useApp();

  // Metrics calculations
  const todayOrders = orders; // Demo set represents active working session
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.orderStatus === 'received' || o.orderStatus === 'preparing').length;
  const completedCount = orders.filter(o => o.orderStatus === 'completed' || o.orderStatus === 'ready').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const visitorsCount = customers.length > 0 ? customers.length : orders.length; // Unique customers or fallback to orders
  const conversionRate = visitorsCount > 0 ? ((orders.length / visitorsCount) * 100).toFixed(1) : '0.0';

  // Calculate category sales split dynamically
  const categorySalesSplit = React.useMemo(() => {
    const categoryRevenue: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = categories.find(c => c.id === product.categoryId);
          if (category) {
            const revenue = item.price * item.quantity;
            categoryRevenue[category.name] = (categoryRevenue[category.name] || 0) + revenue;
          }
        }
      });
    });

    const colors = ['bg-orange-600', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'];

    return Object.entries(categoryRevenue)
      .map(([label, revenue]) => ({
        label,
        pct: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
        revenue
      }))
      .sort((a, b) => b.pct - a.pct)
      .map((cat, idx) => ({
        ...cat,
        color: colors[idx % colors.length]
      }));
  }, [orders, products, categories, totalRevenue]);

  // Peak ordering hours - calculated dynamically from orders
  const hourlyData = React.useMemo(() => {
    const hourCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const hour = date.getHours();
      const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
    });

    const maxOrders = Math.max(...Object.values(hourCounts), 1);
    
    // Generate hours dynamically based on available data (default to 12 PM - 10 PM if no orders)
    const availableHours = Object.keys(hourCounts);
    const hours = availableHours.length > 0 
      ? availableHours.sort((a, b) => {
          const getHourValue = (label: string) => {
            const match = label.match(/(\d+)\s*(AM|PM)/i);
            if (!match) return 12;
            const hour = parseInt(match[1]);
            const period = match[2].toUpperCase();
            return period === 'AM' ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
          };
          return getHourValue(a) - getHourValue(b);
        })
      : ['12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'];
    
    return hours.map(hour => ({
      hour,
      orders: hourCounts[hour] || 0,
      height: maxOrders > 0 ? Math.round((hourCounts[hour] || 0) / maxOrders * 100) : 0
    }));
  }, [orders]);

  // Calculate peak hour label
  const peakHourLabel = React.useMemo(() => {
    if (hourlyData.length === 0) return 'No data';
    const peakItem = hourlyData.reduce((max, item) => item.orders > max.orders ? item : max, hourlyData[0]);
    if (peakItem.orders === 0) return 'No orders';
    return `Peak: ${peakItem.hour}`;
  }, [hourlyData]);

  // Top selling dishes - calculated dynamically from orders
  const topItems = React.useMemo(() => {
    const productStats: Record<string, { name: string; count: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!productStats[product.id]) {
            productStats[product.id] = {
              name: product.name,
              count: 0,
              revenue: 0
            };
          }
          productStats[product.id].count += item.quantity;
          productStats[product.id].revenue += item.price * item.quantity;
        }
      });
    });

    return Object.values(productStats)
      .map(item => ({
        ...item,
        pct: orders.length > 0 ? Math.round((item.count / orders.length) * 100) + '%' : '0%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Welcome back, {activeVendor.ownerName}
          </h2>
          <p className="text-xs text-slate-500">
            Here is what&apos;s happening at {activeVendor.name} today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewItemModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </button>
          <button
            onClick={onOpenNewCategoryModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Orders ({pendingCount})</span>
          </button>
          <button
            onClick={() => onNavigateTab('tables_qr')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Generate QR</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-slate-900">
            {activeVendor.currency}
            {totalRevenue.toFixed(0)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +18.4% vs yesterday
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-slate-900">
            {todayOrders.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Live active count</div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              In Kitchen
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-amber-600">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Needs attention</div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-slate-900">
            {completedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Served & paid</div>
        </div>

        {/* QR Menu Visitors */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visitors
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-slate-900">
            {visitorsCount}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">Unique QR scans</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Conversion
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-heading font-extrabold text-slate-900">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Views to Orders</div>
        </div>
      </div>

      {/* Analytics Charts & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Ordering Hours SVG Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Peak Ordering Hours
              </h3>
              <p className="text-xs text-slate-500">
                Hourly dining order volumes and rush period density
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700">
              {peakHourLabel}
            </span>
          </div>

          {/* Clean Interactive SVG Bar Visualizer */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-slate-100">
              {hourlyData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    {item.orders} orders
                  </div>

                  <div
                    style={{ height: `${item.height}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.orders >= 25
                        ? 'bg-orange-600 group-hover:bg-orange-700'
                        : 'bg-orange-200 group-hover:bg-orange-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-900 truncate">
                    {item.hour}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category-wise Sales Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Category Sales Split
            </h3>
            <p className="text-xs text-slate-500">Revenue distribution across menu lines</p>
          </div>

          <div className="space-y-3">
            {categorySalesSplit.length > 0 ? (
              categorySalesSplit.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{cat.label}</span>
                    <span>{cat.pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-4">
                No category data available
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Order Value:</span>
            <span className="font-bold text-slate-900">
              {activeVendor.currency}
              {avgOrderValue.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Selling Items + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Top Selling Dishes
            </h3>
            <span className="text-xs text-slate-400">By sales volume</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topItems.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.name}</h4>
                    <span className="text-[11px] text-slate-400">{item.count} orders</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {activeVendor.currency}
                    {item.revenue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {item.pct} reorder rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900">Recent Orders</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map(ord => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">#{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        ord.orderStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ord.customerName} •{' '}
                    {ord.diningType === 'dine_in' ? ord.tableNumber || 'Table' : ord.diningType}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {activeVendor.currency}
                    {ord.total.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    {ord.paymentMethod} • {ord.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
