import React, { useState, useEffect } from 'react';
import { CartItem, PluginConfig, ComplementaryUpsell, Product } from '../types';
import { COMPLEMENTARY_UPSELLS } from '../data/mockProducts';
import { calculateDeliveryEstimate, DeliveryEstimate } from '../utils/deliveryCountdown';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Gift,
  Truck,
  Tag,
  Send,
  Sparkles,
  Shield,
  Package,
  Zap,
  Clock,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  config: PluginConfig;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onAddToCart: (product: Product) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onOpenExitIntent: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  config,
  onUpdateQuantity,
  onAddToCart,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Point of Checkout Priority Micro-Bumps State
  const [includeProtection, setIncludeProtection] = useState(true);
  const [includeGiftBox, setIncludeGiftBox] = useState(false);

  // Live Estimated Delivery Countdown State
  const [estimate, setEstimate] = useState<DeliveryEstimate>(() =>
    calculateDeliveryEstimate(
      config.cutoffHour,
      config.cutoffMinute,
      config.transitDays,
      config.businessDaysOnly
    )
  );

  useEffect(() => {
    if (!isOpen || !config.enableDeliveryCountdown) return;

    const updateEst = () => {
      setEstimate(
        calculateDeliveryEstimate(
          config.cutoffHour,
          config.cutoffMinute,
          config.transitDays,
          config.businessDaysOnly
        )
      );
    };

    updateEst();
    const interval = setInterval(updateEst, 1000);
    return () => clearInterval(interval);
  }, [
    isOpen,
    config.enableDeliveryCountdown,
    config.cutoffHour,
    config.cutoffMinute,
    config.transitDays,
    config.businessDaysOnly,
  ]);

  if (!isOpen) return null;

  // Calculate Base Cart Subtotal
  const baseSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Micro-bumps cost
  const protectionFee = includeProtection && config.enableCheckoutProtectionBump ? config.protectionBumpPrice : 0;
  const giftBoxFee = includeGiftBox && config.enableGiftBoxBump ? config.giftBoxBumpPrice : 0;
  const pointOfCheckoutAddons = protectionFee + giftBoxFee;

  const subtotal = baseSubtotal + pointOfCheckoutAddons;

  // Reward Tiers
  const t1 = config.tier1Threshold;
  const t2 = config.tier2Threshold;
  const t3 = config.tier3Threshold;

  const t1Unlocked = subtotal >= t1;
  const t2Unlocked = subtotal >= t2;
  const t3Unlocked = subtotal >= t3;

  const maxThreshold = t3 > 0 ? t3 : 160;
  const progressPercent = Math.min(100, Math.max(0, (subtotal / maxThreshold) * 100));

  let rewardMessage = '';
  if (subtotal === 0) {
    rewardMessage = `Add $${t1.toFixed(2)} to unlock ${config.tier1Title}`;
  } else if (!t1Unlocked) {
    const remaining = (t1 - subtotal).toFixed(2);
    rewardMessage = `Add $${remaining} more to unlock ${config.tier1Title}!`;
  } else if (!t2Unlocked) {
    const remaining = (t2 - subtotal).toFixed(2);
    rewardMessage = `🎉 ${config.tier1Title} unlocked! Add $${remaining} for ${config.tier2Title}!`;
  } else if (!t3Unlocked) {
    const remaining = (t3 - subtotal).toFixed(2);
    rewardMessage = `🎁 ${config.tier2Title} unlocked! Add $${remaining} for ${config.tier3Title}!`;
  } else {
    rewardMessage = `✨ Maximum VIP tier unlocked! You get all perks + ${config.tier3Title}!`;
  }

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon === config.exitIntentCouponCode) {
    discountAmount = (subtotal * config.exitIntentDiscountPercent) / 100;
  } else if (t3Unlocked) {
    discountAmount = (subtotal * 15) / 100;
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Determine complementary upsells to display
  // 1. Identify cart product IDs
  const cartProductIds = cart.map(item => item.product.id);

  // 2. Filter upsells that complement items in cart and are NOT already in cart
  const relevantUpsells = COMPLEMENTARY_UPSELLS.filter(upsell => {
    const isAlreadyInCart = cartProductIds.includes(upsell.id);
    if (isAlreadyInCart) return false;
    
    // Check if paired with any item in cart
    const isPaired = upsell.pairedProductIds.some(pid => cartProductIds.includes(pid));
    return isPaired;
  });

  // If no specific pair matches, show any available upsells not yet in cart
  const displayedUpsells =
    relevantUpsells.length > 0
      ? relevantUpsells
      : COMPLEMENTARY_UPSELLS.filter(u => !cartProductIds.includes(u.id)).slice(0, 2);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = onApplyCoupon(couponInput.trim());
    if (ok) {
      setCouponMessage({ text: 'Coupon applied successfully!', isError: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try SAVE10PULSE', isError: true });
    }
  };

  const handleAddUpsell = (upsell: ComplementaryUpsell) => {
    const productAdapter: Product = {
      id: upsell.id,
      name: upsell.name,
      category: upsell.category,
      price: upsell.price,
      originalPrice: upsell.originalPrice,
      rating: 4.9,
      reviewsCount: 88,
      image: upsell.image,
      shortDesc: upsell.shortDesc,
      stockCount: 15,
      isBumpEligible: true,
      tags: ['Complementary Upsell'],
    };
    onAddToCart(productAdapter);
  };

  // WhatsApp order text with order bumps listed
  const itemsText = cart
    .map(i => `• ${i.quantity}x ${i.product.name} ($${(i.product.price * i.quantity).toFixed(2)})`)
    .join('\n');
  const addOnsText = [
    includeProtection ? `• Transit Protection: $${config.protectionBumpPrice.toFixed(2)}` : null,
    includeGiftBox ? `• Luxury Gift Box: $${config.giftBoxBumpPrice.toFixed(2)}` : null,
  ].filter(Boolean).join('\n');

  const waMessage = encodeURIComponent(
    `${config.whatsAppMessageTemplate}\n\n*Cart Items:*\n${itemsText}${
      addOnsText ? `\n\n*Point-of-Checkout Add-ons:*\n${addOnsText}` : ''
    }\n\n*Subtotal:* $${subtotal.toFixed(2)}\n*Unlocked Perks:* ${
      t1Unlocked ? 'Free Shipping ' : ''
    }${t2Unlocked ? '+ Free Gift ' : ''}${t3Unlocked ? '+ VIP Discount' : ''}\n\nPlease confirm my order reservation!`
  );
  const cleanPhone = config.whatsAppNumber.replace(/[^0-9]/g, '') || '15553829011';
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Your Shopping Bag</h2>
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full tabular-nums">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Estimated Delivery Countdown based on store hours */}
          {config.enableDeliveryCountdown && (
            <div className="bg-amber-50/80 border-b border-amber-200/70 px-5 py-2.5 shrink-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-slate-800 font-medium truncate">
                  Order within <strong className="text-amber-900 font-mono tabular-nums">{estimate.countdownString}</strong> to receive by <strong className="text-slate-900">{estimate.deliveryDateString}</strong>
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded shrink-0">
                {estimate.isSameDayDispatch ? config.dispatchLabel : 'Priority Transit'}
              </span>
            </div>
          )}

          {/* Dynamic Multi-Tier Reward Progress Bar */}
          {config.enableTieredRewards && (
            <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-3 shrink-0">
              <div className="text-xs font-medium text-slate-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{rewardMessage}</span>
              </div>

              {/* Progress bar line */}
              <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Tier checkpoints */}
              <div className="grid grid-cols-3 gap-1 mt-2 text-[11px] text-slate-600">
                <div className={`flex flex-col items-center text-center ${t1Unlocked ? 'text-emerald-700 font-semibold' : ''}`}>
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span className="tabular-nums font-mono">${t1}</span>
                  </div>
                  <span className="text-[10px] truncate max-w-[85px]">{config.tier1Title}</span>
                </div>
                <div className={`flex flex-col items-center text-center ${t2Unlocked ? 'text-emerald-700 font-semibold' : ''}`}>
                  <div className="flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    <span className="tabular-nums font-mono">${t2}</span>
                  </div>
                  <span className="text-[10px] truncate max-w-[85px]">{config.tier2Title}</span>
                </div>
                <div className={`flex flex-col items-center text-center ${t3Unlocked ? 'text-emerald-700 font-semibold' : ''}`}>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span className="tabular-nums font-mono">${t3}</span>
                  </div>
                  <span className="text-[10px] truncate max-w-[85px]">{config.tier3Title}</span>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Center: Cart Items + Complementary Upsell Section */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-900">Your shopping bag is empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add items to see live Order Bumps and milestone rewards calculated in real time!
                </p>
              </div>
            ) : (
              <>
                {/* Active Cart Items */}
                <div className="space-y-3.5">
                  {cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 last:border-b-0"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-semibold text-slate-900 truncate">
                            {item.product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, 0)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.product.category}</p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Stepper */}
                          <div className="flex items-center border border-slate-200 rounded bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-slate-600 hover:text-slate-900 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-xs font-medium text-slate-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-slate-600 hover:text-slate-900 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* COMPLEMENTARY UPSELL ORDER BUMPS SECTION */}
                {config.enableOrderBump && displayedUpsells.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {config.bumpHeading}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {config.bumpDiscountPercent}% Off Bundle Pricing
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {displayedUpsells.map(upsell => (
                        <div
                          key={upsell.id}
                          className="p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl hover:border-amber-300 transition-all flex items-center justify-between gap-3 group"
                        >
                          <img
                            src={upsell.image}
                            alt={upsell.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-cover bg-white shrink-0 border border-amber-200/60 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[10px] text-amber-800 font-medium">
                              <span>{upsell.badgeText}</span>
                            </div>
                            <h5 className="text-xs font-semibold text-slate-900 truncate group-hover:text-amber-950">
                              {upsell.name}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {upsell.recommendationReason}
                            </p>

                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs font-bold text-slate-900 tabular-nums font-mono">
                                ${upsell.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] line-through text-slate-400 tabular-nums font-mono">
                                ${upsell.originalPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddUpsell(upsell)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs shrink-0 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupon Code Input */}
                <div className="pt-1">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder="Discount code (e.g. SAVE10PULSE)"
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {couponMessage && (
                    <p className={`text-[11px] mt-1.5 ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="font-medium">Active: {appliedCoupon}</span>
                      <span className="font-bold">-{config.exitIntentDiscountPercent}% Applied</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* DRAWER FOOTER: POINT-OF-CHECKOUT BUMPS & ACTIONS */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-3.5 shrink-0 shadow-lg">
              {/* POINT-OF-CHECKOUT PRIORITY MICRO-BUMPS */}
              <div className="space-y-2 pt-1 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Point-of-Checkout Add-ons
                </span>

                {/* 1. Priority Packaging & Lifetime Transit Guarantee Bump */}
                {config.enableCheckoutProtectionBump && (
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={includeProtection}
                      onChange={e => setIncludeProtection(e.target.checked)}
                      className="mt-0.5 rounded text-slate-900 focus:ring-slate-900 accent-emerald-600"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>{config.protectionBumpTitle}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          +${config.protectionBumpPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Guarantees priority warehouse packing queue & instant replacement if damaged.
                      </p>
                    </div>
                  </label>
                )}

                {/* 2. Artisanal Gift Box Bump */}
                {config.enableGiftBoxBump && (
                  <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={includeGiftBox}
                      onChange={e => setIncludeGiftBox(e.target.checked)}
                      className="mt-0.5 rounded text-slate-900 focus:ring-slate-900 accent-emerald-600"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-amber-600 inline" />
                          <span>{config.giftBoxBumpTitle}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          +${config.giftBoxBumpPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Individually wrapped in recycled Japanese kraft with raw wax seal stamp.
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items Subtotal</span>
                  <span className="tabular-nums font-mono font-medium">${baseSubtotal.toFixed(2)}</span>
                </div>
                {pointOfCheckoutAddons > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Point-of-Checkout Add-ons</span>
                    <span className="tabular-nums font-mono font-medium">+${pointOfCheckoutAddons.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Applied</span>
                    <span className="tabular-nums font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-slate-900">
                    {t1Unlocked ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      '$9.50'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="tabular-nums font-mono">
                    ${(finalTotal + (t1Unlocked ? 0 : 9.5)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Cart Recovery Action */}
              {config.enableWhatsAppRecovery && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{config.whatsAppButtonText}</span>
                </a>
              )}

              {/* Proceed to Checkout CTA */}
              <button
                type="button"
                onClick={() => setCheckoutComplete(true)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Proceed to Secure Checkout</span>
                <span>&rarr;</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 256-bit SSL
                </span>
                <span>·</span>
                <span>30-Day Money Back Guarantee</span>
              </div>
            </div>
          )}

          {/* Checkout Success Simulation Modal */}
          {checkoutComplete && (
            <div className="absolute inset-0 bg-white z-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Order Bump Successfully Added!</h3>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Your complementary upsells and checkout add-ons increased the Average Order Value by{' '}
                <strong className="text-slate-900 font-mono">
                  +${(subtotal - (cart[0]?.product.price || 0)).toFixed(2)}
                </strong>{' '}
                with zero friction!
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutComplete(false);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Return to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
