import React, { useState, useEffect } from 'react';
import { ActiveTab, CartItem, Product, PluginConfig } from './types';
import { DEFAULT_CONFIG, MOCK_PRODUCTS } from './data/mockProducts';
import { Header } from './components/Header';
import { StorefrontView } from './components/StorefrontView';
import { CartDrawer } from './components/CartDrawer';
import { ExitIntentModal } from './components/ExitIntentModal';
import { StickyAddToCartBar } from './components/StickyAddToCartBar';
import { CustomizerView } from './components/CustomizerView';
import { MarketInsightsView } from './components/MarketInsightsView';
import { PluginExporterView } from './components/PluginExporterView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [config, setConfig] = useState<PluginConfig>(DEFAULT_CONFIG);
  
  // Initialize with 1 item so store owners immediately see the progress bar in action
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS[2], // Organic Serum ($48) -> only $2 away from Free Shipping ($50)
      quantity: 1,
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [hasTriggeredExitOnce, setHasTriggeredExitOnce] = useState(false);
  const [stickyProduct, setStickyProduct] = useState<Product>(MOCK_PRODUCTS[0]);

  // Exit-Intent Mouseleave Detection
  useEffect(() => {
    if (!config.enableExitIntent) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredExitOnce && cart.length > 0) {
        setIsExitIntentOpen(true);
        setHasTriggeredExitOnce(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasTriggeredExitOnce, cart.length, config.enableExitIntent]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setStickyProduct(product);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleApplyCoupon = (code: string): boolean => {
    if (code.trim().toUpperCase() === config.exitIntentCouponCode.toUpperCase()) {
      setAppliedCoupon(config.exitIntentCouponCode);
      return true;
    }
    return false;
  };

  const handleSetCartPreset = (targetAmount: number) => {
    if (targetAmount === 55) {
      // 1 item that unlocks tier 1
      setCart([
        {
          product: MOCK_PRODUCTS[2], // $48
          quantity: 1,
        },
        {
          product: MOCK_PRODUCTS[4], // $18
          quantity: 1,
        },
      ]);
    } else if (targetAmount === 165) {
      // items that unlock all tiers ($160+)
      setCart([
        {
          product: MOCK_PRODUCTS[0], // $185
          quantity: 1,
        },
      ]);
    }
    setIsCartOpen(true);
  };

  const handleResetCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const handleApplyAndOpenCart = () => {
    setAppliedCoupon(config.exitIntentCouponCode);
    setIsExitIntentOpen(false);
    setIsCartOpen(true);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-Zone Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'simulator' && (
          <StorefrontView
            config={config}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
            onTriggerExitIntent={() => setIsExitIntentOpen(true)}
            onSetCartPreset={handleSetCartPreset}
            onResetCart={handleResetCart}
            cartCount={totalCartCount}
            onSelectStickyProduct={setStickyProduct}
          />
        )}

        {activeTab === 'customizer' && (
          <CustomizerView
            config={config}
            onChangeConfig={setConfig}
            onOpenCartPreview={() => setIsCartOpen(true)}
          />
        )}

        {activeTab === 'insights' && <MarketInsightsView />}

        {activeTab === 'exporter' && <PluginExporterView config={config} />}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        config={config}
        onUpdateQuantity={handleUpdateQuantity}
        onAddToCart={handleAddToCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onOpenExitIntent={() => setIsExitIntentOpen(true)}
      />

      {/* Exit-Intent Recovery Modal */}
      <ExitIntentModal
        isOpen={isExitIntentOpen}
        onClose={() => setIsExitIntentOpen(false)}
        config={config}
        onApplyAndOpenCart={handleApplyAndOpenCart}
        subtotal={cartSubtotal}
      />

      {/* Sticky Floating Add to Cart Bar in Simulator */}
      {activeTab === 'simulator' && config.enableStickyBar && stickyProduct && (
        <StickyAddToCartBar
          product={stickyProduct}
          config={config}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={totalCartCount}
        />
      )}

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-serif">WooPulse Pro</span>
            <span aria-hidden="true">·</span>
            <span>Built by Tayyaba Akmal</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Bloat WooCommerce Conversion Architecture</span>
          </div>
          <div className="flex items-center gap-6">
            <span>WordPress 5.8 – 6.7+ Compatible</span>
            <span aria-hidden="true">·</span>
            <span>WooCommerce 5.0 – 9.3+ Ready</span>
            <span aria-hidden="true">·</span>
            <span>GPLv2 Licensed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
