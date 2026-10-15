import React, { useState } from 'react';
import { Product, PluginConfig } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { Star, Eye, ShoppingBag, Check, ShieldCheck, Truck, ArrowRight, Sparkles } from 'lucide-react';

interface StorefrontViewProps {
  config: PluginConfig;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onTriggerExitIntent: () => void;
  onSetCartPreset: (amount: number) => void;
  onResetCart: () => void;
  cartCount: number;
  onSelectStickyProduct: (product: Product) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  onAddToCart,
  onOpenCart,
  onTriggerExitIntent,
  onSetCartPreset,
  onResetCart,
  cartCount,
  onSelectStickyProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = ['All', 'Leather Goods', 'Horology', 'Skincare', 'Home & Living'];

  const filteredProducts = selectedCategory === 'All'
    ? MOCK_PRODUCTS.filter(p => !p.isBumpEligible)
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory && !p.isBumpEligible);

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    onSelectStickyProduct(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Simulation Helper Banner for Store Owners */}
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-100">Live WooPulse Simulator:</span>
          <span className="text-slate-300 hidden sm:inline">
            Test the live conversion widgets exactly as your customers experience them.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onTriggerExitIntent}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Trigger Exit Modal
          </button>
          <button
            type="button"
            onClick={() => onSetCartPreset(55)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Preset: Unlock Free Shipping ($55)
          </button>
          <button
            type="button"
            onClick={() => onSetCartPreset(165)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            Preset: Unlock VIP Tier ($165)
          </button>
          <button
            type="button"
            onClick={onResetCart}
            className="px-2.5 py-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            Reset Cart
          </button>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[380px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/product_leather_bag_1792103254745.jpg"
            alt="Artisanal Heritage Goods"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative max-w-2xl px-6 sm:px-12 py-12 space-y-4">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Autumn Heritage Collection · Handcrafted in Small Batches
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-white leading-tight">
            Designed for durability. Crafted without compromise.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Experience our timeless essentials. Every purchase is paired with real-time milestone perks,
            instant slide-out cart access, and 1-click WhatsApp order fulfillment.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleAdd(MOCK_PRODUCTS[0])}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Add Featured Messenger ($185)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-lg backdrop-blur-xs transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open Mini-Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Filter Controls (Functional Tabs) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Showing <span className="font-semibold text-slate-800">{filteredProducts.length}</span> curated items
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="group bg-white rounded-xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col"
          >
            {/* Lead with imagery */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              {/* Quick view button */}
              <button
                type="button"
                onClick={() => setQuickViewProduct(product)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                title="Quick preview"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Content block */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Clean unboxed text metadata (Zero-pill rule) */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center text-amber-600 font-medium">
                    <Star className="w-3 h-3 fill-current inline mr-0.5" />
                    {product.rating} ({product.reviewsCount})
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {product.shortDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums font-mono">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-[11px] line-through text-slate-400 tabular-nums">
                      ${product.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    addedId === product.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {addedId === product.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setQuickViewProduct(null)}
          />
          <div className="min-h-screen px-4 flex items-center justify-center">
            <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
              <div className="aspect-4/3 md:aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    {quickViewProduct.category} · In Stock ({quickViewProduct.stockCount} left)
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">{quickViewProduct.name}</h3>
                  <div className="text-base font-bold text-slate-900 mt-2 font-mono tabular-nums">
                    ${quickViewProduct.price.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {quickViewProduct.shortDesc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div>
                      <strong className="text-slate-700">Dimensions:</strong> {quickViewProduct.dimensions}
                    </div>
                    <div>
                      <strong className="text-slate-700">Material:</strong> {quickViewProduct.material}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAdd(quickViewProduct);
                      setQuickViewProduct(null);
                      onOpenCart();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag & View Rewards</span>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Eligible for Free Priority Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Value Proposition Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3.5">
          <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Dynamic Free Shipping</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Live calculation in the cart drawer unlocks complimentary delivery when spending goals are reached.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero-Bloat Vanilla JS</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Less than 10KB total script weight. Zero jQuery overhead ensures 100/100 Google PageSpeed scores.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Instant WhatsApp Save</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers can send their pending cart directly to WhatsApp for support assistance and instant COD checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
