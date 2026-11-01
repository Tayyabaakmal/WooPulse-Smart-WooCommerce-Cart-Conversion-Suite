import React, { useState, useEffect, useRef } from 'react';
import { CartItem, PluginConfig, ComplementaryUpsell, Product } from '../types';
import { COMPLEMENTARY_UPSELLS, FREE_GIFT_OPTIONS } from '../data/mockProducts';
import { calculateDeliveryEstimate, DeliveryEstimate } from '../utils/deliveryCountdown';
import { formatPrice } from '../utils/currency';
import { fireMilestoneConfetti, soundEffects } from '../utils/celebration';
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
  Volume2,
  VolumeX,
  Check,
  Crown,
  ChevronDown,
  ChevronUp,
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

  const [soundOn, setSoundOn] = useState(config.enableCelebrationSound !== false);
  const prevTierRef = useRef<number>(0);

  const t1Unlocked = subtotal >= t1;
  const t2Unlocked = subtotal >= t2;
  const t3Unlocked = subtotal >= t3;

  // Trigger celebration confetti and audio chime when ascending milestone tier
  useEffect(() => {
    if (!isOpen) return;
    const currentTier = t3Unlocked ? 3 : t2Unlocked ? 2 : t1Unlocked ? 1 : 0;
    if (currentTier > prevTierRef.current && prevTierRef.current >= 0) {
      fireMilestoneConfetti(currentTier as 1 | 2 | 3);
    }
    prevTierRef.current = currentTier;
  }, [isOpen, t1Unlocked, t2Unlocked, t3Unlocked]);

  const maxThreshold = t3 > 0 ? t3 : 160;
  const progressPercent = Math.min(100, Math.max(0, (subtotal / maxThreshold) * 100));

  const t1Pos = Math.min(92, Math.max(8, (t1 / maxThreshold) * 100));
  const t2Pos = Math.min(92, Math.max(8, (t2 / maxThreshold) * 100));
  const t3Pos = 97;

  const t1Nearing = !t1Unlocked && subtotal >= t1 * 0.65;
  const t2Nearing = t1Unlocked && !t2Unlocked && subtotal >= t2 * 0.75;
  const t3Nearing = t2Unlocked && !t3Unlocked && subtotal >= t3 * 0.85;

  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>('gift-silk-pouch');
  const [isGiftPickerExpanded, setIsGiftPickerExpanded] = useState<boolean>(false);

  // Auto-select gift when tier 2 is unlocked
  useEffect(() => {
    if (t2Unlocked && !selectedGiftId) {
      setSelectedGiftId(FREE_GIFT_OPTIONS[0].id);
    }
  }, [t2Unlocked, selectedGiftId]);

  const activeGift = t2Unlocked && selectedGiftId
    ? FREE_GIFT_OPTIONS.find(g => g.id === selectedGiftId) || null
    : null;

  const handleSelectGift = (giftId: string) => {
    setSelectedGiftId(giftId);
    fireMilestoneConfetti(2);
  };

  let rewardMessage = '';
  if (subtotal === 0) {
    rewardMessage = `Add ${formatPrice(t1, config.selectedCurrency || 'USD')} to unlock ${config.tier1Title}`;
  } else if (!t1Unlocked) {
    const remaining = Math.max(0, t1 - subtotal);
    rewardMessage = `Add ${formatPrice(remaining, config.selectedCurrency || 'USD')} more to unlock ${config.tier1Title}!`;
  } else if (!t2Unlocked) {
    const remaining = Math.max(0, t2 - subtotal);
    rewardMessage = `🎉 ${config.tier1Title} unlocked! Add ${formatPrice(remaining, config.selectedCurrency || 'USD')} for ${config.tier2Title}!`;
  } else if (!t3Unlocked) {
    const remaining = Math.max(0, t3 - subtotal);
    rewardMessage = `🎁 ${config.tier2Title} unlocked! Add ${formatPrice(remaining, config.selectedCurrency || 'USD')} for ${config.tier3Title}!`;
  } else {
    rewardMessage = `✨ VIP Reward Unlocked! All perks active + ${config.tier3Title}!`;
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextState = !soundOn;
                  setSoundOn(nextState);
                  soundEffects.enabled = nextState;
                }}
                className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                  soundOn ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100'
                }`}
                title={soundOn ? 'Celebration sounds & chimes active' : 'Celebration sounds muted'}
                aria-label="Toggle celebration audio"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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

          {/* Dynamic Shimmering Multi-Tier Reward Progress Track */}
          {config.enableTieredRewards && (
            <div className={`border-b px-5 py-3.5 shrink-0 transition-all duration-300 ${
              t3Unlocked 
                ? 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-amber-50/70 border-emerald-200/80 shadow-xs' 
                : 'bg-slate-50/90 border-slate-200/80'
            }`}>
              {/* Header Status Bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 min-w-0">
                  <div className={`p-1 rounded-md shrink-0 transition-colors ${
                    t3Unlocked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {t3Unlocked ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <span className="truncate">{rewardMessage}</span>
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                  t3Unlocked 
                    ? 'bg-amber-500 text-white shadow-2xs shadow-amber-500/30' 
                    : progressPercent > 0 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {t3Unlocked ? 'VIP Active' : `${Math.round(progressPercent)}%`}
                </span>
              </div>

              {/* Shimmering Progress Bar Track with Milestone Pins */}
              <div className="relative pt-2 pb-2">
                {/* Background Rail */}
                <div className="relative w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                  {/* Shimmer Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      t3Unlocked ? 'shimmer-progress-vip' : 'shimmer-progress-standard'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Milestone Node 1 (Free Shipping) */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-transform duration-200 hover:scale-110 cursor-pointer"
                  style={{ left: `${t1Pos}%` }}
                  onMouseEnter={() => setHoveredTier(1)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      t1Unlocked
                        ? 'bg-emerald-600 text-white ring-2 ring-white shadow-emerald-600/30'
                        : t1Nearing
                        ? 'bg-white text-emerald-600 border-2 border-emerald-500 animate-reward-pulse'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {t1Unlocked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Truck className="w-3 h-3" />}
                  </div>

                  {/* Micro Tooltip */}
                  {hoveredTier === 1 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-40 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl text-center pointer-events-none">
                      <p className="font-bold text-emerald-300">{config.tier1Title}</p>
                      <p className="text-[10px] text-slate-300">Unlock at {formatPrice(t1, config.selectedCurrency || 'USD')}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  )}
                </div>

                {/* Milestone Node 2 (Free Gift) */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-transform duration-200 hover:scale-110 cursor-pointer"
                  style={{ left: `${t2Pos}%` }}
                  onMouseEnter={() => setHoveredTier(2)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      t2Unlocked
                        ? 'bg-emerald-600 text-white ring-2 ring-white shadow-emerald-600/30'
                        : t2Nearing
                        ? 'bg-white text-emerald-600 border-2 border-emerald-500 animate-reward-pulse'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {t2Unlocked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Gift className="w-3 h-3" />}
                  </div>

                  {/* Micro Tooltip */}
                  {hoveredTier === 2 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-40 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl text-center pointer-events-none">
                      <p className="font-bold text-emerald-300">{config.tier2Title}</p>
                      <p className="text-[10px] text-slate-300">Unlock at {formatPrice(t2, config.selectedCurrency || 'USD')}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  )}
                </div>

                {/* Milestone Node 3 (VIP 15% Off) */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-transform duration-200 hover:scale-110 cursor-pointer"
                  style={{ left: `${t3Pos}%` }}
                  onMouseEnter={() => setHoveredTier(3)}
                  onMouseLeave={() => setHoveredTier(null)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      t3Unlocked
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-white ring-2 ring-white shadow-amber-500/40'
                        : t3Nearing
                        ? 'bg-white text-amber-600 border-2 border-amber-500 animate-reward-pulse'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {t3Unlocked ? <Crown className="w-3.5 h-3.5 stroke-[2.5]" /> : <Tag className="w-3 h-3" />}
                  </div>

                  {/* Micro Tooltip */}
                  {hoveredTier === 3 && (
                    <div className="absolute bottom-full right-0 mb-2 z-20 w-44 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl text-center pointer-events-none">
                      <p className="font-bold text-amber-300">{config.tier3Title}</p>
                      <p className="text-[10px] text-slate-300">Unlock at {formatPrice(t3, config.selectedCurrency || 'USD')}</p>
                      <div className="absolute top-full right-3 border-4 border-transparent border-t-slate-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Checkpoint Cards */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-1">
                {/* Tier 1 Label */}
                <div
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    t1Unlocked
                      ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
                      : 'bg-white/60 border-slate-200/70 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold">
                    <Truck className={`w-3 h-3 ${t1Unlocked ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="tabular-nums font-mono">{formatPrice(t1, config.selectedCurrency || 'USD')}</span>
                  </div>
                  <p className="text-[10px] font-medium truncate mt-0.5">{config.tier1Title}</p>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                    t1Unlocked ? 'text-emerald-700 bg-emerald-100/80' : 'text-slate-400 bg-slate-100'
                  }`}>
                    {t1Unlocked ? 'Unlocked' : 'Tier 1'}
                  </span>
                </div>

                {/* Tier 2 Label */}
                <div
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    t2Unlocked
                      ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'
                      : 'bg-white/60 border-slate-200/70 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold">
                    <Gift className={`w-3 h-3 ${t2Unlocked ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="tabular-nums font-mono">{formatPrice(t2, config.selectedCurrency || 'USD')}</span>
                  </div>
                  <p className="text-[10px] font-medium truncate mt-0.5">{config.tier2Title}</p>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                    t2Unlocked ? 'text-emerald-700 bg-emerald-100/80' : 'text-slate-400 bg-slate-100'
                  }`}>
                    {t2Unlocked ? 'Unlocked' : 'Tier 2'}
                  </span>
                </div>

                {/* Tier 3 Label */}
                <div
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    t3Unlocked
                      ? 'bg-amber-50/90 border-amber-200/90 text-amber-900 shadow-2xs'
                      : 'bg-white/60 border-slate-200/70 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold">
                    <Tag className={`w-3 h-3 ${t3Unlocked ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="tabular-nums font-mono">{formatPrice(t3, config.selectedCurrency || 'USD')}</span>
                  </div>
                  <p className="text-[10px] font-medium truncate mt-0.5">{config.tier3Title}</p>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${
                    t3Unlocked ? 'text-amber-700 bg-amber-100' : 'text-slate-400 bg-slate-100'
                  }`}>
                    {t3Unlocked ? 'VIP Active' : 'Tier 3'}
                  </span>
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
                {/* Free Gift Milestone Selector Banner */}
                {config.enableTieredRewards && (
                  <div className="space-y-2">
                    {t2Unlocked ? (
                      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border border-emerald-200/90 rounded-xl p-3 shadow-xs transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Gift className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                                  Reward Unlocked
                                </span>
                                <span className="text-xs font-bold text-slate-900">Choose Your Free Gift</span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {activeGift ? `Selected: ${activeGift.name}` : 'Tap below to select your complimentary gift'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsGiftPickerExpanded(!isGiftPickerExpanded)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                          >
                            <span>{isGiftPickerExpanded ? 'Hide Options' : 'Change Gift'}</span>
                            {isGiftPickerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Expandable Free Gift Selector Grid */}
                        {isGiftPickerExpanded && (
                          <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t border-emerald-200/60">
                            {FREE_GIFT_OPTIONS.map(gift => {
                              const isSelected = selectedGiftId === gift.id;
                              return (
                                <div
                                  key={gift.id}
                                  onClick={() => handleSelectGift(gift.id)}
                                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                                      : 'bg-white/70 border-emerald-200/60 hover:bg-white hover:border-emerald-300'
                                  }`}
                                >
                                  <img
                                    src={gift.image}
                                    alt={gift.name}
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-slate-900 truncate">{gift.name}</span>
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50 shrink-0">
                                        {gift.badge}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{gift.subtitle}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[11px] font-bold text-emerald-600 font-mono">FREE</span>
                                      <span className="text-[10px] line-through text-slate-400 font-mono">
                                        {formatPrice(gift.retailPrice, config.selectedCurrency || 'USD')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : subtotal > 0 && t1Unlocked ? (
                      <div className="bg-amber-50/60 border border-dashed border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-slate-700 truncate">
                            Add <strong className="text-amber-900 font-mono">{formatPrice(t2 - subtotal, config.selectedCurrency || 'USD')}</strong> more to claim a <strong>Free Luxury Gift</strong> ($18 value)!
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Next Perk
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Active Cart Items */}
                <div className="space-y-3.5">
                  {/* Claimed Free Gift Line Item */}
                  {activeGift && (
                    <div className="flex items-start gap-3.5 pb-3.5 border-b border-emerald-100 bg-emerald-50/40 p-2.5 rounded-xl border border-dashed border-emerald-300/80 transition-all">
                      <img
                        src={activeGift.image}
                        alt={activeGift.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover bg-white shrink-0 border border-emerald-200 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-2xs">
                                Free Gift
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-800">{activeGift.badge}</span>
                            </div>
                            <h3 className="text-xs font-semibold text-slate-900 mt-1 truncate">
                              {activeGift.name}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedGiftId(null)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                            title="Remove free gift"
                            aria-label="Remove free gift"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{activeGift.subtitle}</p>

                        <div className="flex items-center justify-between mt-2">
                          <button
                            type="button"
                            onClick={() => setIsGiftPickerExpanded(true)}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 flex items-center gap-1"
                          >
                            <Gift className="w-3 h-3" />
                            <span>Change Gift</span>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] line-through text-slate-400 font-mono">
                              {formatPrice(activeGift.retailPrice, config.selectedCurrency || 'USD')}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              FREE
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                            {formatPrice(item.product.price * item.quantity, config.selectedCurrency || 'USD')}
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
                                {formatPrice(upsell.price, config.selectedCurrency || 'USD')}
                              </span>
                              <span className="text-[11px] line-through text-slate-400 tabular-nums font-mono">
                                {formatPrice(upsell.originalPrice, config.selectedCurrency || 'USD')}
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
                          +{formatPrice(config.protectionBumpPrice, config.selectedCurrency || 'USD')}
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
                          +{formatPrice(config.giftBoxBumpPrice, config.selectedCurrency || 'USD')}
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
                  <span className="tabular-nums font-mono font-medium">{formatPrice(baseSubtotal, config.selectedCurrency || 'USD')}</span>
                </div>
                {pointOfCheckoutAddons > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Point-of-Checkout Add-ons</span>
                    <span className="tabular-nums font-mono font-medium">+{formatPrice(pointOfCheckoutAddons, config.selectedCurrency || 'USD')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Applied</span>
                    <span className="tabular-nums font-mono">-{formatPrice(discountAmount, config.selectedCurrency || 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-slate-900">
                    {t1Unlocked ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      formatPrice(9.5, config.selectedCurrency || 'USD')
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Grand Total</span>
                  <span className="tabular-nums font-mono">
                    {formatPrice(finalTotal + (t1Unlocked ? 0 : 9.5), config.selectedCurrency || 'USD')}
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
                  +{formatPrice(Math.max(0, subtotal - (cart[0]?.product.price || 0)), config.selectedCurrency || 'USD')}
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
