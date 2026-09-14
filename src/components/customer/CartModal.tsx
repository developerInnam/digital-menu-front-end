import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  Gift,
  ArrowRight,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CartModal: React.FC = () => {
  const {
    activeVendor,
    cart,
    cartTotals,
    appliedCoupon,
    isRedeemingPoints,
    setIsRedeemingPoints,
    removeCoupon,
    applyCouponCode,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    placeOrder,
    activeTableNumber,
    setIsTableModalOpen,
    customers,
    language,
    setActiveTrackingOrderId
  } = useApp();

  if (!activeVendor) return null;

  const t = translations[language];

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Checkout form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [diningType, setDiningType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNumber, setTableNumber] = useState(activeTableNumber);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    setTableNumber(activeTableNumber);
  }, [activeTableNumber]);

  // Check if customer phone matches existing loyalty points
  const matchedCustomer = customers.find(c => c.phone === customerPhone);
  const availablePoints = matchedCustomer ? matchedCustomer.loyaltyPoints : 50; // default 50 points demo bonus

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCouponCode(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponError('');
    } else {
      setCouponError(res.message);
      setCouponSuccess('');
    }
  };

  const handleCheckout = async () => {
    if (!customerPhone || customerPhone.trim().length < 8) {
      setCheckoutError('Please enter a valid phone number (at least 8 digits) for live order tracking.');
      return;
    }

    try {
      setIsSubmitting(true);
      setCheckoutError('');

      const order = await placeOrder({
        customerName: customerName.trim() || 'Valued Guest',
        customerPhone: customerPhone.trim(),
        diningType,
        tableNumber: diningType === 'dine_in' ? tableNumber : undefined,
        deliveryAddress: diningType === 'delivery' ? deliveryAddress : undefined,
        notes: orderNotes,
        paymentMethod
      });

      setIsSubmitting(false);
      setIsCartOpen(false);
      if (order && order.id) {
        setActiveTrackingOrderId(order.id);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setCheckoutError(err.message || 'Unable to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        id="cart-drawer"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-slate-900">{t.cartTitle}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {cartTotals.itemCount} {cartTotals.itemCount === 1 ? t.item : t.items}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-slate-800 text-base">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Explore our chef specialties and handcrafted items to fill your tray.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md shadow-orange-600/20 transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Happy Hour Banner if applicable */}
            {cartTotals.happyHourDiscount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {t.happyHourActive} - You saved {activeVendor.currency}
                  {cartTotals.happyHourDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.map(item => (
                <div
                  key={item.itemKey}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.product.vegType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.product.name}
                      </h4>
                    </div>

                    {/* Variant & Addons tags */}
                    {(item.selectedVariant || item.selectedAddons?.length > 0) && (
                      <div className="mt-1 text-[11px] text-slate-500 space-y-0.5">
                        {item.selectedVariant && <div>• {item.selectedVariant.name}</div>}
                        {item.selectedAddons?.map(a => (
                          <div key={a.id}>• +{a.name}</div>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <p className="mt-1 text-[10px] italic text-amber-700 bg-amber-50/70 px-1.5 py-0.5 rounded inline-block">
                        &quot;{item.specialInstructions}&quot;
                      </p>
                    )}

                    <div className="mt-2 font-bold text-xs text-slate-900">
                      {activeVendor.currency}
                      {(item.itemPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateCartQuantity(item.itemKey, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-rose-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.itemKey, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Engine */}
            <div className="border-t border-slate-100 pt-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold uppercase">{appliedCoupon.code}</span> applied!
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="WELCOME50 or TASTY20"
                        value={couponInput}
                        onChange={e => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>
                  )}
                </form>
              )}
            </div>

            {/* Loyalty Points Redemption */}
            <div className="border-t border-slate-100 pt-3">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isRedeemingPoints
                    ? 'bg-amber-50/70 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isRedeemingPoints}
                    onChange={e => setIsRedeemingPoints(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-semibold">{t.redeemPoints}</span>
                    <p className="text-[10px] text-slate-500">
                      {availablePoints} {t.pointsAvailable} (Save up to {activeVendor.currency}50)
                    </p>
                  </div>
                </div>
                <span className="font-bold text-amber-700">
                  -{activeVendor.currency}
                  {Math.min(cartTotals.subtotal * 0.5, 50).toFixed(0)}
                </span>
              </label>
            </div>

            {/* Dining Option (Dine-in / Takeaway / Delivery) */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t.diningOption}
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDiningType('dine_in')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    diningType === 'dine_in'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.dineIn}
                </button>
                <button
                  type="button"
                  onClick={() => setDiningType('takeaway')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    diningType === 'takeaway'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.takeaway}
                </button>
                <button
                  type="button"
                  onClick={() => setDiningType('delivery')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    diningType === 'delivery'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.delivery}
                </button>
              </div>

              {diningType === 'dine_in' && (
                <div className="flex items-center justify-between p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs">
                  <div>
                    <span className="text-orange-950 font-medium">Assigned Table: </span>
                    <button
                      type="button"
                      onClick={() => setIsTableModalOpen(true)}
                      className="text-[11px] text-orange-600 font-bold hover:underline ml-1"
                    >
                      Pick Table
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={e => setTableNumber(e.target.value)}
                    className="w-24 text-center font-bold px-2 py-1 bg-white border border-orange-300 rounded-lg text-orange-700 text-xs focus:outline-none"
                  />
                </div>
              )}

              {diningType === 'delivery' && (
                <div className="space-y-1">
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Enter complete delivery address & landmark"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customer Contact Information */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t.customerDetails}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={t.fullName}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder={`${t.phoneNumber} *`}
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Kitchen notes (e.g. deliver with extra cutlery)"
                value={orderNotes}
                onChange={e => setOrderNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'upi'
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-orange-600" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash / Counter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold ring-1 ring-orange-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Card POS</span>
                </button>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800 mb-1">{t.billDetails}</div>
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>
                  {activeVendor.currency}
                  {cartTotals.subtotal.toFixed(2)}
                </span>
              </div>

              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>
                    -{activeVendor.currency}
                    {cartTotals.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {cartTotals.happyHourDiscount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Happy Hour Discount (20%)</span>
                  <span>
                    -{activeVendor.currency}
                    {cartTotals.happyHourDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {cartTotals.pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Loyalty Points Redeemed</span>
                  <span>
                    -{activeVendor.currency}
                    {cartTotals.pointsDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t.gst}</span>
                <span>
                  {activeVendor.currency}
                  {cartTotals.gst.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>{t.total}</span>
                <span>
                  {activeVendor.currency}
                  {cartTotals.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
            {checkoutError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{checkoutError}</span>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50"
            >
              <div className="text-left">
                <div className="text-[11px] font-normal text-orange-100 uppercase tracking-wider">
                  Total Payable
                </div>
                <div>
                  {activeVendor.currency}
                  {cartTotals.total.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span>{isSubmitting ? 'Placing...' : t.placeOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
