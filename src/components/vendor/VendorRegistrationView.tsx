import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { SubscriptionPlanModal } from '../common/SubscriptionPlanModal';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  DollarSign,
  Utensils,
  Plus
} from 'lucide-react';

export const VendorRegistrationView: React.FC = () => {
  const navigate = useNavigate();
  const { registerVendor, subscriptionPlans, setSubscriptionPlans } = useApp();

  const [restaurantName, setRestaurantName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('11:00 PM');
  const [tablesCount, setTablesCount] = useState(12);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('pro');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [tableServiceAvailable, setTableServiceAvailable] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const generatedSlug = restaurantName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'my-restaurant';

  const handleSaveSubscriptionPlans = async (plans: any[]) => {
    try {
      await setSubscriptionPlans(plans);
      if (plans.length > 0) {
        setSubscriptionPlan(plans[0].id as any);
      }
    } catch (error) {
      console.error('Error saving subscription plans:', error);
      alert('Failed to save subscription plans');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim()) {
      setErrorMessage('Please provide a restaurant name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await registerVendor({
        name: restaurantName.trim(),
        slug: generatedSlug,
        tagline: tagline.trim() || 'Delicious Gourmet Dining & Refreshments',
        description: 'Authentic cuisine prepared fresh with premium local ingredients.',
        ownerName: ownerName.trim() || 'Head Chef / Owner',
        email: email.trim() || `contact@${generatedSlug}.com`,
        phone: phone.trim() || '+91 98765 43210',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        address: address.trim() || 'Central Avenue, Culinary District',
        googleMapUrl: 'https://maps.google.com',
        openingTime,
        closingTime,
        currency,
        gstNumber: '33AAAAA0000A1Z5',
        whatsapp: phone.trim() || '+91 98765 43210',
        instagram: `@${generatedSlug}`,
        facebook: `facebook.com/${generatedSlug}`,
        deliveryAvailable,
        pickupAvailable,
        tableServiceAvailable,
        happyHourEnabled: false,
        happyHourDiscount: 15,
        happyHourStart: '16:00',
        happyHourEnd: '18:00',
        taxPercent: 5,
        tablesCount: Number(tablesCount) || 12,
        subscriptionPlan
      });

      // Celebrate onboarding
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }

      // Redirect to vendor dashboard
      navigate(`/vendor/${generatedSlug}/dashboard`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register restaurant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 animate-in fade-in duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>

          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
            SaaS Restaurant Onboarding
          </span>
        </div>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-7 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Register Your Restaurant
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                Launch your branded digital QR menu, live kitchen display system (KDS), POS orders, and table management in minutes on MongoDB.
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Basic Restaurant Information */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              Restaurant Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">
                  Restaurant / Cafe Name <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder="e.g., The Rustic Bistro & Pizzeria"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
                <p className="text-[11px] text-slate-400">
                  Public URL preview:{' '}
                  <span className="font-mono text-orange-600 font-semibold">
                    dinesmart.app/menu/{generatedSlug}
                  </span>
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Tagline / Cuisine Specialty</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g., Artisanal Sourdough Pizzas, Craft Burgers & Mocktails"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Owner / Manager Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g., Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Currency Symbol</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                  <option value="AED">AED (United Arab Emirates Dirham)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Contact & Hours
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@restaurant.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact / WhatsApp Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Physical Address / City</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g., Shop 4, Galleria Mall, Downtown District"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={e => setOpeningTime(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={e => setClosingTime(e.target.value)}
                  placeholder="11:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dining Features & Tables */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              Dining Services & Table Setup
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={tableServiceAvailable}
                  onChange={e => setTableServiceAvailable(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                Dine-in Table QR
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={pickupAvailable}
                  onChange={e => setPickupAvailable(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                Takeaway / Pickup
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={e => setDeliveryAvailable(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                Home Delivery
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Initial Number of Tables for QR Generation</label>
              <input
                type="number"
                min="1"
                max="100"
                value={tablesCount}
                onChange={e => setTablesCount(Number(e.target.value))}
                className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Section 4: Subscription Plan Selection */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Select Platform Plan
              </h2>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subscription Plan
              </button>
            </div>

            {subscriptionPlans.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                <p className="text-sm text-slate-500 mb-2">No subscription plans available</p>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  Add your first plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {subscriptionPlans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSubscriptionPlan(plan.id as any)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      subscriptionPlan === plan.id
                        ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{plan.name}</span>
                      {subscriptionPlan === plan.id && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">{plan.price}</div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{plan.desc}</p>
                    <div className="mt-2">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {plan.tablesLimit === -1 ? 'Unlimited Tables' : `${plan.tablesLimit} Tables`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 flex items-center gap-2 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering on MongoDB...' : 'Register Restaurant & Launch Dashboard'}</span>
            </button>
          </div>
        </form>

        {/* Subscription Plan Modal */}
        <SubscriptionPlanModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSave={handleSaveSubscriptionPlans}
          existingPlans={subscriptionPlans}
        />
      </div>
    </div>
  );
};
