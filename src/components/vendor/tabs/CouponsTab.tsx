import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Coupon, CouponType } from '../../../types';
import {
  Tag,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
  X
} from 'lucide-react';

export const CouponsTab: React.FC = () => {
  const { coupons, activeVendor, addCoupon, toggleCouponActive, updateVendorDetails } = useApp();

  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<CouponType>('percentage');
  const [value, setValue] = useState(20);
  const [minPurchase, setMinPurchase] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(150);

  // Happy hour state
  const [happyHourEnabled, setHappyHourEnabled] = useState(activeVendor.happyHourEnabled);
  const [happyHourDiscount, setHappyHourDiscount] = useState(activeVendor.happyHourDiscount);
  const [happyHourStart, setHappyHourStart] = useState(activeVendor.happyHourStart);
  const [happyHourEnd, setHappyHourEnd] = useState(activeVendor.happyHourEnd);
  const [savedHappyHourNotice, setSavedHappyHourNotice] = useState(false);

  const handleSaveHappyHour = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendorDetails({
      happyHourEnabled,
      happyHourDiscount: Number(happyHourDiscount),
      happyHourStart,
      happyHourEnd
    });
    setSavedHappyHourNotice(true);
    setTimeout(() => setSavedHappyHourNotice(false), 2500);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      value: Number(value),
      minPurchase: Number(minPurchase),
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      isActive: true,
      validTill: '2026-12-31'
    });

    setCode('');
    setIsAddCouponOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Coupons & Happy Hour Engine
          </h2>
          <p className="text-xs text-slate-500">
            Drive table turnarounds and increase order size with dynamic promotions.
          </p>
        </div>

        <button
          onClick={() => setIsAddCouponOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Two Column Section: Happy Hour Automation & Promo Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Happy Hour Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-heading font-bold text-base">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Automated Happy Hour</span>
          </div>
          <p className="text-xs text-slate-500">
            Automatically applies a percentage discount on all diner orders placed during off-peak hours.
          </p>

          <form onSubmit={handleSaveHappyHour} className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer">
              <span>Enable Happy Hour</span>
              <input
                type="checkbox"
                checked={happyHourEnabled}
                onChange={e => setHappyHourEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500"
              />
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={happyHourDiscount}
                onChange={e => setHappyHourDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={happyHourStart}
                  onChange={e => setHappyHourStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={happyHourEnd}
                  onChange={e => setHappyHourEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save Schedule
            </button>

            {savedHappyHourNotice && (
              <p className="text-[11px] text-emerald-600 font-semibold text-center">
                ✓ Happy hour schedule saved!
              </p>
            )}
          </form>
        </div>

        {/* Promo Codes Directory */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900">
            Active Promo Codes ({coupons.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {coupons.map(coupon => (
              <div
                key={coupon.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-sm text-slate-900 uppercase">
                        {coupon.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.value}% OFF (Max ${activeVendor.currency}${coupon.maxDiscount})`
                        : coupon.discountType === 'flat'
                        ? `Flat ${activeVendor.currency}${coupon.value} OFF`
                        : 'Free Delivery'}
                      {' • '}Min spend: {activeVendor.currency}
                      {coupon.minPurchase}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Used {coupon.usageCount}x
                  </span>
                  <button
                    onClick={() => toggleCouponActive(coupon.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                      coupon.isActive
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-heading font-bold text-base text-slate-900">
                New Promotion Code
              </h3>
              <button
                onClick={() => setIsAddCouponOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. FESTIVE25"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as CouponType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Value {discountType === 'percentage' ? '(%)' : `(${activeVendor.currency})`}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Purchase
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={e => setMinPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Cap {discountType === 'percentage' ? '' : '(N/A)'}
                  </label>
                  <input
                    type="number"
                    disabled={discountType !== 'percentage'}
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
