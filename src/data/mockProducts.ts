import { Product, PluginConfig } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-bag-01',
    name: 'Artisan Heritage Leather Messenger',
    category: 'Leather Goods',
    price: 185,
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 128,
    image: '/src/assets/images/product_leather_bag_1792103254745.jpg',
    shortDesc: 'Full-grain vegetable-tanned leather handcrafted with solid antique brass hardware, storm flap, and padded 15" laptop sleeve.',
    stockCount: 6,
    tags: ['Best Seller', 'Handcrafted'],
    dimensions: '38cm × 28cm × 10cm',
    material: 'Full-Grain Tuscan Cowhide'
  },
  {
    id: 'prod-watch-02',
    name: 'Nordic Minimalist Automatic Field Watch',
    category: 'Horology',
    price: 145,
    originalPrice: 175,
    rating: 4.8,
    reviewsCount: 94,
    image: '/src/assets/images/product_watch_minimal_1792103254889.jpg',
    shortDesc: 'Brushed 316L stainless steel case, matte black anti-reflective dial, Japanese automatic mechanical movement, and vegetable-tanned strap.',
    stockCount: 4,
    tags: ['Limited Run'],
    dimensions: '39mm diameter · 10.5mm thickness',
    material: '316L Surgical Steel & Horween Leather'
  },
  {
    id: 'prod-serum-03',
    name: 'Organic Botanical Radiance Repair Serum',
    category: 'Skincare',
    price: 48,
    originalPrice: 60,
    rating: 5.0,
    reviewsCount: 312,
    image: '/src/assets/images/product_serum_bottle_1792103254749.jpg',
    shortDesc: 'Cold-pressed botanical elixir rich in squalane, bakuchiol, and organic rosehip to restore elasticity and natural luminance.',
    stockCount: 12,
    tags: ['Clean Beauty', 'Organic'],
    dimensions: '30ml / 1.0 fl oz dropper',
    material: 'Recycled Amber Glass Bottle'
  },
  {
    id: 'prod-mug-04',
    name: 'Handcrafted Speckled Stoneware Mug',
    category: 'Home & Living',
    price: 34,
    rating: 4.9,
    reviewsCount: 76,
    image: '/src/assets/images/product_ceramic_mug_1792103255046.jpg',
    shortDesc: 'Wheel-thrown ceramic mug with raw iron speckling, custom glazed interior, and ergonomic comfort handle for morning pour-overs.',
    stockCount: 9,
    tags: ['Artisanal'],
    dimensions: '360ml / 12 fl oz capacity',
    material: 'Natural High-Fire Stoneware'
  },
  {
    id: 'prod-balm-bump',
    name: 'Organic Beeswax & Jojoba Leather Balm',
    category: 'Accessories & Care',
    price: 18,
    originalPrice: 24,
    rating: 4.9,
    reviewsCount: 180,
    image: '/src/assets/images/product_serum_bottle_1792103254749.jpg',
    shortDesc: 'Natural conditioning balm to protect and weatherproof fine leather goods and boots. One-click cart favorite.',
    stockCount: 25,
    isBumpEligible: true,
    tags: ['Popular Add-On'],
    dimensions: '60ml metal tin',
    material: 'Organic Beeswax, Jojoba & Sweet Almond'
  }
];

export const COMPLEMENTARY_UPSELLS: import('../types').ComplementaryUpsell[] = [
  {
    id: 'upsell-balm-01',
    name: 'Organic Beeswax Leather Conditioning Balm',
    category: 'Leather Care',
    price: 13.5,
    originalPrice: 18.0,
    discountPercent: 25,
    image: '/src/assets/images/upsell_leather_balm_1792104022765.jpg',
    shortDesc: 'Natural beeswax & jojoba oil formula to waterproof and preserve fine grain leather.',
    pairedProductIds: ['prod-bag-01'],
    recommendationReason: 'Extends the lifespan of your Artisan Leather Messenger',
    badgeText: 'Frequently Paired Together'
  },
  {
    id: 'upsell-coffee-02',
    name: 'Peru Cajamarca Whole Bean Roast (340g)',
    category: 'Artisanal Coffee',
    price: 16.5,
    originalPrice: 22.0,
    discountPercent: 25,
    image: '/src/assets/images/upsell_coffee_beans_1792104022658.jpg',
    shortDesc: 'Single-origin washed roast with rich chocolate, almond, and caramel notes.',
    pairedProductIds: ['prod-mug-04'],
    recommendationReason: 'Freshly roasted companion for your Handcrafted Stoneware Mug',
    badgeText: 'Perfect Pairing'
  },
  {
    id: 'upsell-watchroll-03',
    name: 'Horween Leather Watch Protection Sleeve',
    category: 'Horology Accessories',
    price: 25.5,
    originalPrice: 34.0,
    discountPercent: 25,
    image: '/src/assets/images/product_watch_minimal_1792103254889.jpg',
    shortDesc: 'Hand-stitched vegetable-tanned leather pouch with suede interior lining.',
    pairedProductIds: ['prod-watch-02'],
    recommendationReason: 'Safeguards your Automatic Field Watch from everyday scratches',
    badgeText: 'Travel Companion'
  },
  {
    id: 'upsell-mist-04',
    name: 'Organic Rosewater Botanical Hydrating Mist',
    category: 'Skincare',
    price: 18.0,
    originalPrice: 24.0,
    discountPercent: 25,
    image: '/src/assets/images/product_serum_bottle_1792103254749.jpg',
    shortDesc: 'Steam-distilled floral mist designed to prime skin before applying face serums.',
    pairedProductIds: ['prod-serum-03'],
    recommendationReason: 'Maximizes serum absorption and restores pH balance',
    badgeText: 'Skincare Routine Booster'
  }
];

export const DEFAULT_CONFIG: PluginConfig = {
  storeName: 'Nordic Heritage & Co.',
  currencySymbol: '$',
  currencyCode: 'USD',
  
  // Progress Bar Tiers
  enableTieredRewards: true,
  tier1Threshold: 50,
  tier1Title: 'Free Standard Shipping',
  tier2Threshold: 100,
  tier2Title: 'Free Mystery Gift',
  tier3Threshold: 160,
  tier3Title: '15% Off VIP Order',
  
  // Visual Theme
  primaryColor: '#0f172a', // Slate 900
  accentColor: '#059669',  // Emerald 600
  themeStyle: 'modern-minimal',
  
  // WhatsApp Cart Recovery
  enableWhatsAppRecovery: true,
  whatsAppNumber: '+1 (555) 382-9011',
  whatsAppButtonText: 'Save Cart & Chat on WhatsApp',
  whatsAppMessageTemplate: 'Hello! I am ordering from Nordic Heritage & Co. Here is my cart summary:',
  
  // Exit-Intent Cart Saver
  enableExitIntent: true,
  exitIntentHeadline: 'Wait! Don’t leave empty-handed',
  exitIntentDiscountPercent: 10,
  exitIntentCouponCode: 'SAVE10PULSE',
  exitIntentTimerMinutes: 10,
  
  // Order Bumps & Complementary Upsells
  enableOrderBump: true,
  bumpDiscountPercent: 25,
  bumpHeading: 'Frequently Bought Together',
  bumpPitch: 'Add complementary essentials to your bag at 25% off',
  
  // Point-of-Checkout Priority Micro-Bumps
  enableCheckoutProtectionBump: true,
  protectionBumpPrice: 4.95,
  protectionBumpTitle: 'Priority Fulfillment & Lifetime Transit Guarantee',
  enableGiftBoxBump: true,
  giftBoxBumpPrice: 5.5,
  giftBoxBumpTitle: 'Artisanal Gift Box with Custom Wax Seal & Card',
  
  // Sticky Cart
  enableStickyBar: true,

  // Estimated Delivery Countdown
  enableDeliveryCountdown: true,
  cutoffHour: 17, // 5:00 PM local store hours
  cutoffMinute: 0,
  transitDays: 2,
  businessDaysOnly: true,
  dispatchLabel: 'Same-Day Dispatch',
};
