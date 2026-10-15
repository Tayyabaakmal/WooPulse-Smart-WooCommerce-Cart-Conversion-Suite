import React from 'react';
import { Product, PluginConfig } from '../types';
import { ShoppingBag, Check } from 'lucide-react';

interface StickyAddToCartBarProps {
  product: Product;
  config: PluginConfig;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  onAddToCart,
  onOpenCart,
  cartCount,
}) => {
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 sm:py-3 shadow-lg max-h-[14vh]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Product summary */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 tabular-nums font-mono">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="line-through text-slate-400 tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="hidden sm:inline text-[11px] text-emerald-600 font-medium">In Stock</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-xs flex items-center gap-1.5"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors hidden sm:flex items-center gap-1.5"
          >
            <span>View Bag</span>
            {cartCount > 0 && (
              <span className="bg-slate-900 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2 tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
