import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Product, VegType, StockStatus } from '../../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Flame,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface MenuManagementTabProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const MenuManagementTab: React.FC<MenuManagementTabProps> = ({
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  const {
    products,
    categories,
    activeVendor,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    updateProductStock
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for add/edit modal
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(299);
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  );
  const [vegType, setVegType] = useState<VegType>('veg');
  const [spicyLevel, setSpicyLevel] = useState(1);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [isPopular, setIsPopular] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  const filteredProducts = products.filter(p => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setPrice(299);
    setCategoryId(categories[0]?.id || '');
    setImageUrl(
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    );
    setVegType('veg');
    setSpicyLevel(1);
    setPrepTimeMinutes(15);
    setIsPopular(false);
    setIsRecommended(false);
    setDiscountPercent(0);
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategoryId(prod.categoryId);
    setImageUrl(prod.imageUrl);
    setVegType(prod.vegType);
    setSpicyLevel(prod.spicyLevel);
    setPrepTimeMinutes(prod.prepTimeMinutes);
    setIsPopular(prod.isPopular);
    setIsRecommended(prod.isRecommended);
    setDiscountPercent(prod.discountPercent || 0);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        description,
        price: Number(price),
        categoryId,
        imageUrl,
        vegType,
        spicyLevel: Number(spicyLevel),
        prepTimeMinutes: Number(prepTimeMinutes),
        isPopular,
        isRecommended,
        discountPercent: Number(discountPercent)
      });
    } else {
      addProduct({
        categoryId: categoryId || categories[0]?.id,
        name,
        description,
        price: Number(price),
        imageUrl,
        vegType,
        spicyLevel: Number(spicyLevel),
        prepTimeMinutes: Number(prepTimeMinutes),
        isAvailable: true,
        stockStatus: 'in_stock',
        stockCount: 50,
        isPopular,
        isRecommended,
        discountPercent: Number(discountPercent),
        ingredients: ['Chef selected fresh ingredients'],
        variants: [
          { id: 'v1', name: 'Regular Portion', priceDiff: 0 },
          { id: 'v2', name: 'Large Shareable', priceDiff: 80 }
        ],
        addons: [
          { id: 'a1', name: 'Extra Sauce / Dip', price: 29 },
          { id: 'a2', name: 'Gourmet Cheese Top', price: 49 }
        ]
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="font-heading font-bold text-base text-slate-900">
            Menu Item Management
          </h2>
          <p className="text-xs text-slate-500">
            Add, edit, change pricing, and toggle in-stock availability instantly.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filters: Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Online Live</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              prod.vegType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <span className="truncate">{prod.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {prod.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {categories.find(c => c.id === prod.categoryId)?.name || 'General'}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900">
                    {activeVendor.currency}
                    {prod.price}
                    {prod.discountPercent ? (
                      <span className="ml-1 text-[10px] text-emerald-600 font-normal">
                        ({prod.discountPercent}% off)
                      </span>
                    ) : null}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={prod.stockStatus}
                      onChange={e =>
                        updateProductStock(prod.id, e.target.value as StockStatus)
                      }
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                        prod.stockStatus === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : prod.stockStatus === 'low_stock'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        prod.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {prod.isAvailable ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${prod.name}" from menu?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Menu Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingProduct ? 'Edit Menu Dish' : 'Add New Menu Dish'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dish / Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="E.g. Truffle Mushroom Pizza"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Ingredients
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short appetizing description..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price ({activeVendor.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dietary Type
                  </label>
                  <select
                    value={vegType}
                    onChange={e => setVegType(e.target.value as VegType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="egg">Contains Egg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spicy Level
                  </label>
                  <select
                    value={spicyLevel}
                    onChange={e => setSpicyLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value={0}>0 - Not Spicy</option>
                    <option value={1}>1 - Mild</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - Hot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={prepTimeMinutes}
                    onChange={e => setPrepTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles: Popular, Recommended, Discount */}
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={e => setIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>Popular Item</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecommended}
                    onChange={e => setIsRecommended(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>Chef Recommended</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs"
                >
                  {editingProduct ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
