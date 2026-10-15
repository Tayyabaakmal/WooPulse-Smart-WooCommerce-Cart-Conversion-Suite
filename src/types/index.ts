export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDesc: string;
  stockCount: number;
  isBumpEligible?: boolean;
  tags?: string[];
  dimensions?: string;
  material?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export interface RewardTier {
  id: string;
  threshold: number;
  title: string;
  rewardType: 'shipping' | 'gift' | 'discount';
  discountValue?: number;
}

export interface ComplementaryUpsell {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  shortDesc: string;
  pairedProductIds: string[];
  recommendationReason: string;
  badgeText: string;
}

export interface PluginConfig {
  storeName: string;
  currencySymbol: string;
  currencyCode: string;
  
  // Progress Bar Tiers
  enableTieredRewards: boolean;
  tier1Threshold: number;
  tier1Title: string;
  tier2Threshold: number;
  tier2Title: string;
  tier3Threshold: number;
  tier3Title: string;
  
  // Visual Theme
  primaryColor: string; // Hex
  accentColor: string;  // Hex
  themeStyle: 'modern-minimal' | 'luxury-editorial' | 'vibrant-retail';
  
  // WhatsApp Cart Recovery
  enableWhatsAppRecovery: boolean;
  whatsAppNumber: string;
  whatsAppButtonText: string;
  whatsAppMessageTemplate: string;
  
  // Exit-Intent Cart Saver
  enableExitIntent: boolean;
  exitIntentHeadline: string;
  exitIntentDiscountPercent: number;
  exitIntentCouponCode: string;
  exitIntentTimerMinutes: number;
  
  // Order Bumps & Complementary Upsells
  enableOrderBump: boolean;
  bumpDiscountPercent: number;
  bumpPitch: string;
  bumpHeading: string;
  
  // Point-of-Checkout Priority Micro-Bumps
  enableCheckoutProtectionBump: boolean;
  protectionBumpPrice: number;
  protectionBumpTitle: string;
  enableGiftBoxBump: boolean;
  giftBoxBumpPrice: number;
  giftBoxBumpTitle: string;
  
  // Sticky Cart
  enableStickyBar: boolean;

  // Estimated Delivery Countdown
  enableDeliveryCountdown: boolean;
  cutoffHour: number; // 0-23 (e.g. 17 for 5 PM)
  cutoffMinute: number; // 0-59
  transitDays: number; // e.g. 2 days
  businessDaysOnly: boolean; // skip weekends
  dispatchLabel: string;
}

export type ActiveTab = 'simulator' | 'customizer' | 'insights' | 'exporter';
