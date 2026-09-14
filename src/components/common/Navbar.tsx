import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import {
  UtensilsCrossed,
  LayoutDashboard,
  ChefHat,
  Smartphone,
  PlusCircle,
  Volume2,
  VolumeX,
  Languages,
  Store,
  ChevronDown,
  ShoppingBag,
  QrCode,
  Database,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenTableSelect?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenTableSelect }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { vendors, activeVendor, setActiveVendor, language, setLanguage, soundAlertEnabled, setSoundAlertEnabled, cartTotals, dbStatus, setIsDbModalOpen, setIsCartOpen, setIsTableModalOpen, setActiveVendorId } = useApp();

  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & SaaS Brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            title="Go to Home"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Dine<span className="text-orange-600">Smart</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Smart QR Menu & Restaurant OS</p>
            </div>
          </button>

          {/* Right Tools: Restaurant selector, Language, Sound, Cart, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logout button for authenticated users */}
            {user && (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Restaurant Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
                title="Switch Restaurant"
              >
                <Store className="w-3.5 h-3.5 text-orange-600" />
                <span className="max-w-[100px] sm:max-w-[140px] truncate">{activeVendor?.name || 'Select Restaurant'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isVendorDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Restaurant
                  </div>
                  {vendors.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveVendorId(v.id);
                        setIsVendorDropdownOpen(false);
                        navigate(`/${v.slug}`);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs transition-colors ${
                        activeVendor && v.id === activeVendor.id ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img src={v.logo} alt={v.name} className="w-6 h-6 rounded-md object-cover border border-slate-200" />
                      <div className="truncate">
                        <div className="truncate">{v.name}</div>
                        <div className="text-[10px] text-slate-400">/{v.slug}</div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsVendorDropdownOpen(false);
                        navigate('/vendor/register');
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs font-semibold text-orange-600 hover:bg-orange-50"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Register New Restaurant
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Change Language"
              >
                <Languages className="w-4 h-4" />
              </button>
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'ta', label: 'தமிழ்' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'ar', label: 'العربية' }
                  ].map(item => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as 'en' | 'ta' | 'hi' | 'ar');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs ${
                        language === item.code ? 'font-bold text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Database & Node.js Express Status Badge */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-semibold transition-colors"
              title="MongoDB & Express Server Status"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline font-mono">
                {dbStatus?.engine === 'mongodb' && dbStatus.isConnected ? 'MongoDB' : 'Express+Mongo'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Sound Notification Toggle */}
            <button
              onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={soundAlertEnabled ? 'Sound notifications active' : 'Sound muted'}
            >
              {soundAlertEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Cart button */}
            <button
              onClick={() => {
                if (onOpenCart) onOpenCart();
                else setIsCartOpen(true);
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="View Your Tray / Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t.cartTitle}</span>
              {cartTotals.itemCount > 0 && (
                <span className="ml-1 bg-white text-orange-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {cartTotals.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
