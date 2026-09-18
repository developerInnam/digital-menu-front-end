import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Product } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { CartModal } from './CartModal';
import { TableSelectionModal } from '../common/TableSelectionModal';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Sparkles,
  Flame,
  Plus,
  ShoppingBag,
  Heart,
  ChevronRight,
  Gift,
  CheckCircle,
  Percent,
  SlidersHorizontal
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    vendors,
    activeVendor,
    setActiveVendor,
    categories,
    products,
    combos,
    cart,
    addToCart,
    cartTotals,
    language,
    activeTableNumber,
    setActiveTableNumber,
    tables,
    orders,
    setIsTableModalOpen,
    isCartOpen,
    setIsCartOpen
  } = useApp();

  if (!activeVendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  // Set vendor based on URL slug
  useEffect(() => {
    if (vendorSlug) {
      const vendor = vendors.find(v => v.slug === vendorSlug);
      if (vendor) {
        setActiveVendor(vendor.id);
      } else {
        // Vendor not found - show error and redirect
        alert(`Restaurant "${vendorSlug}" not found. Redirecting to home page...`);
        navigate('/');
      }
    }
  }, [vendorSlug, vendors, setActiveVendor, navigate]);

  // Set table number from URL query parameter
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      setActiveTableNumber(tableParam);
    }
  }, [searchParams, setActiveTableNumber]);

  const t = translations[language];

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'popular' | 'offers' | 'recommended' | 'combos'>('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const { placeOrder, activeTrackingOrderId, setActiveTrackingOrderId } = useApp();

  // Active or most recent order to allow tracking badge
  const recentOrder = orders[0];

  // Smart AI Recommendations based on cart contents
  const smartRecommendations = useMemo(() => {
    if (cart.length === 0) return [];
    const cartProductIds = cart.map(i => i.product.id);
    const cartCategories = cart.map(i => i.product.categoryId);

    // If customer has pizza/burger/pasta in cart, suggest beverage or sides
    return products
      .filter(p => !cartProductIds.includes(p.id))
      .filter(p => {
        if (cartCategories.includes('cat-burgers') || cartCategories.includes('cat-pizza')) {
          return p.categoryId === 'cat-starters' || p.categoryId === 'cat-drinks';
        }
        return p.isRecommended;
      })
      .slice(0, 3);
  }, [cart, products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesIng = product.ingredients?.some(i => i.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesIng) return false;
      }

      // Category
      if (selectedCategoryId !== 'all' && product.categoryId !== selectedCategoryId) {
        return false;
      }

      // Filter Mode
      if (filterMode === 'popular' && !product.isPopular) return false;
      if (filterMode === 'recommended' && !product.isRecommended) return false;
      if (filterMode === 'offers' && (!product.discountPercent || product.discountPercent === 0)) return false;

      // Dietary
      if (vegFilter === 'veg' && product.vegType !== 'veg') return false;
      if (vegFilter === 'non-veg' && product.vegType === 'veg') return false;

      return true;
    });
  }, [products, searchQuery, selectedCategoryId, filterMode, vegFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Restaurant Hero Banner */}
      <div className="relative h-52 sm:h-64 w-full overflow-hidden bg-slate-900">
        <img
          src={activeVendor.banner}
          alt={activeVendor.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/20" />

        <div className="absolute bottom-4 left-4 right-4 max-w-5xl mx-auto flex items-end justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src={activeVendor.logo}
              alt={activeVendor.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/90 shadow-xl"
            />
            <div className="text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                  {activeVendor.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase">
                  {t.openNow}
                </span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-1 max-w-md mt-0.5">
                {activeVendor.tagline}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {activeVendor.rating} ({activeVendor.totalReviews})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeVendor.openingTime} - {activeVendor.closingTime}
                </span>
              </div>
            </div>
          </div>

          {/* Table Indicator Pill */}
          <button
            onClick={() => setIsTableModalOpen(true)}
            className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Change Dining Table"
          >
            <span>{activeTableNumber}</span>
            <span className="text-[10px] text-orange-200 underline">Change</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Track Active Order Banner if an active order exists */}
        {recentOrder && recentOrder.orderStatus !== 'completed' && (
          <div
            onClick={() => setIsTrackingOpen(true)}
            className="p-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                  Active Order #{recentOrder.orderNumber}
                </div>
                <div className="text-sm font-bold capitalize">
                  Status: {recentOrder.orderStatus} • ~{recentOrder.estimatedTimeMinutes} mins
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-white text-orange-700 px-3 py-1.5 rounded-xl shadow-xs">
              <span>{t.trackOrder}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Search Bar & Veg Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg / Non-veg pills */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0 self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setVegFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vegFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.all}
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vegFilter === 'veg'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t.pureVeg}
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                vegFilter === 'non-veg'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {t.nonVeg}
            </button>
          </div>
        </div>

        {/* Feature Tags Filters (Popular, Offers, Recommended, Combos) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.all} Menu
          </button>
          <button
            onClick={() => setFilterMode('popular')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'popular'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            {t.popular}
          </button>
          <button
            onClick={() => setFilterMode('offers')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'offers'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Percent className="w-3 h-3 text-emerald-500" />
            {t.offers}
          </button>
          <button
            onClick={() => setFilterMode('recommended')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'recommended'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500" />
            {t.recommended}
          </button>
          <button
            onClick={() => setFilterMode('combos')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === 'combos'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Gift className="w-3 h-3 text-purple-500" />
            {t.combos}
          </button>
        </div>

        {/* Category Horizontal Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/80">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`pb-2 px-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
              selectedCategoryId === 'all'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`pb-2 px-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                selectedCategoryId === cat.id
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* AI Smart Recommendation / Upsell Banner */}
        {smartRecommendations.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.pairsWellWith}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {smartRecommendations.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs font-bold text-orange-600">
                      {activeVendor.currency}
                      {item.price}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                    title="Add to tray"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combos Section if Selected or 'All' */}
        {(filterMode === 'all' || filterMode === 'combos') && combos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                <span>Value Saver Combos</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combos.map(combo => (
                <div
                  key={combo.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={combo.imageUrl}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Combo Deal
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900">
                        {combo.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">{combo.description}</p>
                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        {combo.includedItems.map((inc, i) => (
                          <div key={i}>✓ {inc}</div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">
                          {activeVendor.currency}
                          {combo.originalPrice}
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {activeVendor.currency}
                          {combo.price}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          // Quick add a combo mock product
                          const fakeProd: Product = {
                            id: combo.id,
                            vendorId: combo.vendorId,
                            categoryId: 'combos',
                            name: combo.name,
                            description: combo.description,
                            price: combo.price,
                            imageUrl: combo.imageUrl,
                            vegType: 'veg',
                            spicyLevel: 1,
                            prepTimeMinutes: 15,
                            isAvailable: true,
                            stockStatus: 'in_stock',
                            stockCount: 20,
                            isPopular: true,
                            isRecommended: true,
                            variants: [],
                            addons: [],
                            ingredients: combo.includedItems
                          };
                          addToCart(fakeProd);
                        }}
                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Combo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Products Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-slate-900">
              {selectedCategoryId === 'all'
                ? 'All Dishes'
                : categories.find(c => c.id === selectedCategoryId)?.name}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">No dishes found</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting search or dietary filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Clickable Image & Header */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      {/* Veg / Non-veg Indicator */}
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs flex items-center gap-1">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            product.vegType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <span className="text-[10px] font-bold uppercase text-slate-700">
                          {product.vegType === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {product.discountPercent && product.discountPercent > 0 && (
                        <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                          {product.discountPercent}% OFF
                        </div>
                      )}

                      {/* Prep Time & Spicy */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                        <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          <Clock className="w-3 h-3" />
                          {product.prepTimeMinutes} mins
                        </span>

                        {product.spicyLevel > 0 && (
                          <span className="flex items-center gap-0.5 bg-red-600/80 px-2 py-0.5 rounded-md font-semibold backdrop-blur-xs">
                            <Flame className="w-3 h-3 fill-current" />
                            {product.spicyLevel === 1 ? 'Mild' : product.spicyLevel === 2 ? 'Med' : 'Hot'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Add to Cart button */}
                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-base font-bold text-slate-900">
                        {activeVendor.currency}
                        {product.price}
                      </span>
                      {product.variants && product.variants.length > 0 && (
                        <span className="text-[10px] text-slate-400 block font-medium">
                          Customisable
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (product.variants?.length > 0 || product.addons?.length > 0) {
                          setSelectedProduct(product);
                        } else {
                          addToCart(product);
                        }
                      }}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addToCart}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar (Appears when cart has items) */}
      {cartTotals.itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full text-left p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-black transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">
                  {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'} in Tray
                </div>
                <div className="text-sm font-bold text-white">
                  {activeVendor.currency}
                  {cartTotals.total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs">
              <span>{t.viewCart}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Item Customization Bottom Sheet / Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Order Tracking Modal */}
      {isTrackingOpen && recentOrder && (
        <OrderTrackingModal
          orderId={recentOrder.id}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}

      {/* Cart Modal */}
      <CartModal />

      {/* Table Selection Modal */}
      <TableSelectionModal />
    </div>
  );
};
