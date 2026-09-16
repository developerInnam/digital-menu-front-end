import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Vendor } from '../../types';
import { SubscriptionPlanModal } from '../common/SubscriptionPlanModal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  DollarSign,
  Plus,
  ExternalLink,
  CheckCircle2,
  Users,
  Store,
  ChevronRight,
  Sparkles,
  ChefHat,
  Lock,
  Settings,
  Edit2,
  Trash2,
  LogOut
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    vendors,
    activeVendor,
    setActiveVendor,
    setIsDbModalOpen,
    subscriptionPlans,
    setSubscriptionPlans
  } = useApp();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [newVendorName, setNewVendorName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({ totalDinerScans: 0, systemUptime: 99.98 });

  // Calculate MRR dynamically from vendors' subscription plans
  const mrr = vendors.reduce((total, vendor) => {
    const plan = subscriptionPlans.find(p => p.id === (vendor.subscriptionPlan || 'pro'));
    return total + (plan?.priceNumeric || 2499);
  }, 0);

  // Fetch platform stats
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/admin/platform-stats');
        const data = await response.json();
        setPlatformStats(data);
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
      }
    };
    fetchPlatformStats();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim() || !newEmail.trim() || !newPassword.trim()) return;

    try {
      setIsSubmitting(true);
      const slug = newVendorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      await api.createVendor({
        name: newVendorName.trim(),
        slug,
        tagline: 'Authentic flavors and cozy dining experiences',
        description: 'Crafting memorable culinary moments with freshly sourced produce and artisan flair.',
        logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        ownerName: newOwnerName.trim() || 'Restaurant Owner',
        email: newEmail.trim(),
        password: newPassword.trim(),
        phone: newPhone.trim() || '+91 98888 77777',
        whatsapp: newPhone.trim() || '+91 98888 77777',
        instagram: '@bistro_official',
        facebook: 'fb.com/bistroo',
        address: 'Central Boulevard, Metro City',
        googleMapUrl: 'https://maps.google.com',
        openingTime: '11:00 AM',
        closingTime: '11:00 PM',
        deliveryAvailable: true,
        pickupAvailable: true,
        tableServiceAvailable: true,
        currency: '₹',
        taxPercent: 5,
        gstNumber: '33AAACB9999Z1Z5',
        happyHourEnabled: false,
        happyHourDiscount: 15,
        happyHourStart: '16:00',
        happyHourEnd: '18:00',
        tablesCount: 12,
        subscriptionPlan: newPlan,
        role: 'vendor'
      });

      setIsSubmitting(false);
      setIsRegisterOpen(false);
      setNewVendorName('');
      setNewOwnerName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to register vendor:', err);
    }
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setNewVendorName(vendor.name);
    setNewOwnerName(vendor.ownerName);
    setNewEmail(vendor.email);
    setNewPhone(vendor.phone);
    setNewPlan(vendor.subscriptionPlan as 'starter' | 'pro' | 'enterprise');
    setIsEditModalOpen(true);
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor || !newVendorName.trim() || !newEmail.trim()) return;

    try {
      setIsSubmitting(true);
      await api.updateVendor(editingVendor.id, {
        name: newVendorName.trim(),
        ownerName: newOwnerName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        subscriptionPlan: newPlan
      });

      setIsSubmitting(false);
      setIsEditModalOpen(false);
      setEditingVendor(null);
      setNewVendorName('');
      setNewOwnerName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
    } catch (err) {
      setIsSubmitting(false);
      console.error('Failed to update vendor:', err);
    }
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;

    try {
      await api.deleteVendor(vendorToDelete.id);
      setDeleteConfirmOpen(false);
      setVendorToDelete(null);
      if (activeVendor?.id === vendorToDelete.id) {
        setActiveVendor('');
      }
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-xl text-slate-900">
                  DineSmart SaaS Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                  Multi-Tenant Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage restaurant subscriptions, commissions, and multi-vendor onboarding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-orange-600" />
              <span>Manage Plans</span>
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Restaurant</span>
            </button>
            <button
              onClick={() => navigate('/vendor/register')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-orange-600" />
              <span>Self-Serve Portal</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Platform KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Vendors
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
              {vendors.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              100% active operational
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Recurring (MRR)
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
              ₹{mrr.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {vendors.length} active subscriptions
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Diner Scans
            </div>
            <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
              {platformStats.totalDinerScans.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across all restaurant QR codes</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Uptime
            </div>
            <div className="text-2xl font-heading font-extrabold text-emerald-600 mt-1">
              {platformStats.systemUptime}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Real-time socket server</div>
          </div>
        </div>

        {/* Registered Restaurants Directory */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-slate-900">
              Registered Restaurants & Outlets
            </h2>
            <span className="text-xs text-slate-400">{vendors.length} accounts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map(v => {
              const isSelected = activeVendor?.id === v.id;

              return (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-orange-600 bg-orange-50/20 ring-1 ring-orange-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.logo}
                          alt={v.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-heading font-bold text-sm text-slate-900">
                              {v.name}
                            </h3>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-orange-600 text-white">
                                Active Workspace
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{v.tagline}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
                        {v.subscriptionPlan} Plan
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Owner:</span> {v.ownerName}
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span> {v.phone}
                      </div>
                      <div>
                        <span className="text-slate-400">Tables:</span> {v.tablesCount} configured
                      </div>
                      <div>
                        <span className="text-slate-400">Hours:</span> {v.openingTime} -{' '}
                        {v.closingTime}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveVendor(v);
                          navigate(`/${v.slug}`);
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        title="View diner QR menu for this outlet"
                      >
                        <span>Customer Menu</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveVendor(v);
                          navigate(`/vendor/${v.slug}/kds`);
                        }}
                        className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer ml-1"
                        title="Open kitchen display for this outlet"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>KDS</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelected ? (
                        <button
                          onClick={() => setActiveVendor(v)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          Select Outlet
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      )}

                      <button
                        onClick={() => handleEditVendor(v)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-600 text-xs font-semibold cursor-pointer"
                        title="Edit vendor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(v)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 text-xs font-semibold cursor-pointer"
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveVendor(v);
                          navigate(`/vendor/${v.slug}/dashboard`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Register New Vendor Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Register New Restaurant Outlet
            </h3>
            <p className="text-xs text-slate-500">
              Create an isolated restaurant account with personalized menus, QR tables, and analytics.
            </p>

            <form onSubmit={handleRegister} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Restaurant / Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Spice Route Bistro"
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Manager Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Chef Sanjay Rao"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="manager@bistro.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98888 77777"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {subscriptionPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  Create & Launch Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Plans Modal */}
      <SubscriptionPlanModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSave={setSubscriptionPlans}
        existingPlans={subscriptionPlans}
      />

      {/* Edit Vendor Modal */}
      {isEditModalOpen && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Edit Restaurant Outlet
            </h3>
            <p className="text-xs text-slate-500">
              Update restaurant details and subscription plan.
            </p>

            <form onSubmit={handleUpdateVendor} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Restaurant / Outlet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Spice Route Bistro"
                  value={newVendorName}
                  onChange={e => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Manager Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Chef Sanjay Rao"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="manager@bistro.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98888 77777"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {subscriptionPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingVendor(null);
                    setNewVendorName('');
                    setNewOwnerName('');
                    setNewEmail('');
                    setNewPassword('');
                    setNewPhone('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Outlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setVendorToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Restaurant Outlet"
        message={`Are you sure you want to delete "${vendorToDelete?.name}"? This action cannot be undone and will remove all associated data including menus, orders, and customer information.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};
