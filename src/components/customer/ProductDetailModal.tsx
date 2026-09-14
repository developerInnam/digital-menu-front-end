import React, { useState } from 'react';
import { Product, ProductVariant, ProductAddon } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { X, Flame, Clock, Plus, Minus, Check, Sparkles, Heart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variantId?: string,
    addonIds?: string[],
    instructions?: string,
    quantity?: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const { activeVendor, language } = useApp();
  const t = translations[language];

  if (!activeVendor) return null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const currentVariant = product.variants?.find(v => v.id === selectedVariantId);
  const variantExtra = currentVariant ? currentVariant.priceDiff : 0;
  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = product.addons?.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const unitPrice = product.price + variantExtra + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const handleAdd = () => {
    onAddToCart(product, selectedVariantId, selectedAddonIds, instructions, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        id="product-detail-sheet"
      >
        {/* Header Media */}
        <div className="relative h-60 w-full bg-slate-100 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite heart */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Badges on bottom of image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded border ${
                  product.vegType === 'veg'
                    ? 'border-emerald-600 bg-white'
                    : 'border-rose-600 bg-white'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    product.vegType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </span>

              {product.spicyLevel > 0 && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-red-500/90 text-white text-xs font-semibold backdrop-blur-xs">
                  <Flame className="w-3 h-3 fill-current" />
                  {product.spicyLevel === 1 ? t.mild : product.spicyLevel === 2 ? t.medium : t.hot}
                </span>
              )}

              {product.isPopular && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.popular}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <Clock className="w-3 h-3" />
              <span>{product.prepTimeMinutes} mins</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-heading font-bold text-slate-900 leading-tight">
                {product.name}
              </h3>
              <div className="text-xl font-bold text-slate-900 shrink-0">
                {activeVendor.currency}
                {product.price}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Ingredients & Calories */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {product.calories && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                  🔥 {product.calories} kcal
                </span>
              )}
              {product.ingredients &&
                product.ingredients?.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                  >
                    {ing}
                  </span>
                ))}
            </div>
          </div>

          {/* Sizing / Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {t.size}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants?.map(variant => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition-all ${
                      selectedVariantId === variant.id
                        ? 'border-orange-600 bg-orange-50/50 text-orange-950 font-semibold ring-1 ring-orange-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span>{variant.name}</span>
                    <span className="text-xs font-bold">
                      {variant.priceDiff > 0
                        ? `+${activeVendor.currency}${variant.priceDiff}`
                        : 'Included'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons Checklist */}
          {product.addons && product.addons.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {t.addons}
              </label>
              <div className="space-y-2">
                {product.addons?.map(addon => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/40 text-orange-900 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-orange-600 border-orange-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        +{activeVendor.currency}
                        {addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              {t.instructions}
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={t.instructionsPlaceholder}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md shadow-orange-600/20 transition-all active:scale-[0.98]"
          >
            <span>{t.addToCart}</span>
            <span className="font-bold">
              {activeVendor.currency}
              {totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
