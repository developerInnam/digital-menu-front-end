import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { OverviewAnalyticsTab } from './tabs/OverviewAnalyticsTab';
import { OrdersTab } from './tabs/OrdersTab';
import { MenuManagementTab } from './tabs/MenuManagementTab';
import { CategoryManagementTab } from './tabs/CategoryManagementTab';
import { TableQrTab } from './tabs/TableQrTab';
import { KitchenDisplayTab } from './tabs/KitchenDisplayTab';
import { CouponsTab } from './tabs/CouponsTab';
import { CustomersTab } from './tabs/CustomersTab';
import { ShopSettingsTab } from './tabs/ShopSettingsTab';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Layers,
  QrCode,
  Tag,
  Users,
  Store,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface VendorDashboardProps {
  initialTab?: string;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ initialTab = 'overview' }) => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();
  const { vendors, activeVendor, setActiveVendor, orders } = useApp();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Set vendor based on URL slug
  useEffect(() => {
    if (vendorSlug) {
      const vendor = vendors.find(v => v.slug === vendorSlug);
      if (vendor) {
        setActiveVendor(vendor.id);
      } else {
        // Vendor not found, redirect to landing
        navigate('/');
      }
    }
  }, [vendorSlug, vendors, setActiveVendor, navigate]);

  // Synchronize when initialTab changes (e.g. clicking KDS or Vendor Dashboard in navbar)
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Shared modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    o => o.orderStatus === 'received' || o.orderStatus === 'preparing'
  ).length;

  const tabs = [
    { id: 'overview', label: 'Analytics', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'kds', label: 'Kitchen KDS', icon: ChefHat },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'tables_qr', label: 'QR Generator', icon: QrCode },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'shop_details', label: 'Shop Details', icon: Store }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sub-header Navigation Bar for Vendor Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-orange-700' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => activeVendor && navigate(`/${activeVendor.slug}`)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 rounded-xl hover:bg-orange-50 border border-slate-200 transition-colors shrink-0"
            >
              <span>Preview QR Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 border border-slate-200 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewAnalyticsTab
            onNavigateTab={tabId => setActiveTab(tabId)}
            onOpenNewItemModal={() => {
              setActiveTab('menu');
              setIsAddItemModalOpen(true);
            }}
            onOpenNewCategoryModal={() => {
              setActiveTab('categories');
              setIsAddCategoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'orders' && <OrdersTab />}

        {activeTab === 'kds' && <KitchenDisplayTab />}

        {activeTab === 'menu' && (
          <MenuManagementTab
            isAddModalOpen={isAddItemModalOpen}
            setIsAddModalOpen={setIsAddItemModalOpen}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagementTab
            isAddModalOpen={isAddCategoryModalOpen}
            setIsAddModalOpen={setIsAddCategoryModalOpen}
          />
        )}

        {activeTab === 'tables_qr' && <TableQrTab />}

        {activeTab === 'coupons' && <CouponsTab />}

        {activeTab === 'customers' && <CustomersTab />}

        {activeTab === 'shop_details' && <ShopSettingsTab />}
      </div>
    </div>
  );
};
