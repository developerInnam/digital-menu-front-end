import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  ShoppingBag,
  Share2,
  Star,
  MessageCircle,
  ExternalLink,
  ReceiptText
} from 'lucide-react';

interface OrderTrackingModalProps {
  orderId: string | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ orderId, onClose }) => {
  const { orders, activeVendor, language, addOrderReview } = useApp();
  const t = translations[language];

  if (!activeVendor) return null;

  const order = orders.find(o => o.id === orderId) || orders[0];

  const [rating, setRating] = useState<number>(order?.review?.rating || 5);
  const [comment, setComment] = useState<string>(order?.review?.comment || '');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState<boolean>(!!order?.review);

  // Trigger celebratory confetti on mount if recently placed
  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if unavailable
    }
  }, []);

  if (!order) return null;

  const steps = [
    {
      id: 'received',
      label: t.statusReceived,
      sub: 'Order confirmed by kitchen',
      icon: CheckCircle2
    },
    {
      id: 'preparing',
      label: t.statusPreparing,
      sub: 'Chef is crafting your meal',
      icon: ChefHat
    },
    {
      id: 'ready',
      label: t.statusReady,
      sub: 'Plated & awaiting pickup / server',
      icon: BellRing
    },
    {
      id: 'completed',
      label: t.statusCompleted,
      sub: 'Delivered & enjoyed',
      icon: ShoppingBag
    }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  // WhatsApp order share format
  const handleWhatsAppShare = () => {
    const itemsList = order.items
      .map(i => `• ${i.quantity}x ${i.product.name} (₹${(i.itemPrice * i.quantity).toFixed(0)})`)
      .join('%0A');

    const text = `🍽️ *New Order: ${order.orderNumber}* at ${activeVendor.name}%0A%0A*Customer:* ${order.customerName} (${order.customerPhone})%0A*Dining:* ${order.diningType.toUpperCase()} ${order.tableNumber ? `(${order.tableNumber})` : ''}%0A%0A*Items:*%0A${itemsList}%0A%0A*Total Bill:* ₹${order.total.toFixed(2)}%0A*Payment:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})%0A*Status:* ${order.orderStatus.toUpperCase()}`;

    const cleanPhone = activeVendor.whatsapp.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId) {
      addOrderReview(order.id, rating, comment);
      setIsReviewSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        id="order-tracking-modal"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-orange-100">
              Live Order Tracker
            </div>
            <h2 className="text-lg font-heading font-extrabold flex items-center gap-2">
              <span>{order.orderNumber}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium">
                {order.diningType === 'dine_in' ? order.tableNumber || 'Table' : order.diningType}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Estimated Time Card */}
          <div className="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{t.estimatedTime}</div>
                <div className="text-xl font-heading font-bold text-slate-900">
                  ~{order.estimatedTimeMinutes} mins
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.orderStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'ready'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Animated Progress Tracker */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.id} className="relative flex items-start gap-3.5">
                  <div
                    className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110'
                        : isPastOrCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent
                          ? 'text-orange-600'
                          : isPastOrCurrent
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp & Print Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order to WhatsApp</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ReceiptText className="w-4 h-4" />
              <span>Print Receipt / KOT</span>
            </button>
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              <span>Items Ordered</span>
              <span>Price</span>
            </div>
            <div className="divide-y divide-slate-200/60">
              {order.items.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {item.quantity}x {item.product.name}
                    </span>
                    {item.selectedVariant && (
                      <span className="text-slate-500 ml-1">({item.selectedVariant.name})</span>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-slate-500">
                        +{item.selectedAddons.map(a => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-slate-800">
                    {activeVendor.currency}
                    {(item.itemPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Net Total */}
            <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
              <span className="text-sm text-orange-600">
                {activeVendor.currency}
                {order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Customer Meal Rating & Review Form */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              {t.leaveReview}
            </h4>

            {isReviewSubmitted ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.thankYouFeedback} Rating: {rating} ★</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">{rating} of 5</span>
                </div>
                <input
                  type="text"
                  placeholder="Any feedback on food quality, speed, or hospitality?"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  {t.submitReview}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {t.backToMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
