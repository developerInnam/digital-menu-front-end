import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Store, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendors } = useApp();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-8 h-8 text-orange-600" />
              <h1 className="text-xl font-bold text-slate-900">Digital Menu</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => navigate('/vendor/register')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                Register Vendor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Digital Menu for Your Restaurant
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            QR code-based ordering system for restaurants. Let customers scan, browse, and order directly from their phones.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Customer</h3>
            <p className="text-slate-600 mb-6">
              Scan QR code at your table to view menu and place orders instantly.
            </p>
            <button
              onClick={() => {
                if (vendors.length > 0) {
                  navigate(`/${vendors[0].slug}`);
                }
              }}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              View Demo Menu
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vendor Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Vendor</h3>
            <p className="text-slate-600 mb-6">
              Manage your restaurant, menu, orders, and track everything from your dashboard.
            </p>
            <button
              onClick={() => navigate('/vendor/register')}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              Register Restaurant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Admin</h3>
            <p className="text-slate-600 mb-6">
              Manage vendors, monitor platform performance, and oversee all operations.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              Go to Admin Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Vendors */}
        {vendors.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Featured Restaurants
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/${vendor.slug}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="h-48 bg-slate-200 relative">
                    {vendor.banner && (
                      <img
                        src={vendor.banner}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      ⭐ {vendor.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{vendor.name}</h4>
                    <p className="text-sm text-slate-600 mb-4">{vendor.tagline}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{vendor.address?.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
