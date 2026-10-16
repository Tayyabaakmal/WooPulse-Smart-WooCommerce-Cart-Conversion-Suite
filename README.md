# WooPulse Pro — High-Converting WooCommerce Cart & Conversion Suite

An ultra-lightweight, zero-bloat conversion engine built to replace multiple fragmented WordPress plugins. Features a dynamic multi-tier progress reward bar, slide-out AJAX mini-cart drawer, complementary in-cart order bumps, point-of-checkout priority add-ons, and direct WhatsApp cart recovery.

Author: **Tayyaba Akmal** ([@tayyabaakmal](https://github.com/tayyabaakmal))  
License: **GPLv2 or later**  
Frontend Payload: **Under 10KB (Zero jQuery dependencies)**  
Compatibility: **WordPress 5.8 to 6.7+ | WooCommerce 5.0 to 9.3+**  

---

## Overview

WooCommerce stores routinely lose more than 70% of potential orders at the cart stage. By default, shoppers must endure full page reloads between the product page, cart, and checkout. There is little visual incentive to add more items, and when unexpected shipping fees appear, users abandon their carts.

To address this, merchants commonly stitch together four or five separate plugins:
- A slide-out mini-cart plugin
- A free shipping threshold progress bar
- An upsell / frequently bought together plugin
- A WhatsApp cart recovery extension
- An exit-intent coupon popup

In practice, this approach adds 400KB to 700KB of redundant jQuery overhead, degrades mobile PageSpeed scores, creates plugin conflicts on checkout, and costs hundreds of dollars each year in SaaS subscriptions.

**WooPulse Pro** was built by Tayyaba Akmal to solve this problem from first principles: a unified, cohesive conversion engine written in pure vanilla JavaScript (< 10KB) that delivers modern cart drawer mechanics, dynamic spending incentives, and high-converting order bumps without slowing down the store.

---

## Key Capabilities

### Dynamic Multi-Tier Reward Progress Bar
- Calculates progress in real time within the mini-cart drawer without page reloads.
- Configurable milestone checkpoints:
  - Tier 1: Free Standard Shipping (e.g., $50)
  - Tier 2: Free Mystery Gift / Product Sample (e.g., $100)
  - Tier 3: 15% VIP Discount on Order (e.g., $160)
- Clear feedback messages that show customers exactly how much more they need to spend to unlock the next perk.

### Instant Slide-Out AJAX Mini-Cart
- Immediate open and close transitions with backdrop blur.
- Live quantity steppers and item deletion with instant subtotal updates.
- Integrated coupon application with live client-side validation.

### Complementary In-Cart Order Bumps
- Context-Aware Recommendations: Suggests paired accessories based on items currently in the cart (for example, conditioning balm for leather bags, travel rolls for watches, or fresh beans for coffee mugs).
- 1-Click Addition: Customers add recommended add-ons directly into their cart at discounted bundle pricing.
- Automatic Deduplication: Recommended products automatically hide once they are added to the bag.

### Point-of-Checkout Priority Add-ons
- Placed directly in the drawer footer above the checkout button:
  - Priority Transit Guarantee (e.g., +$4.95 for priority queue and damage protection).
  - Artisanal Gift Box Packaging (e.g., +$5.50 for wrapped box and custom seal).
- Automatically mapped to standard WooCommerce fee calculations using the `woocommerce_cart_calculate_fees` hook.

### Estimated Delivery Countdown
- Calculates and displays a dynamic arrival date based on local store hours and cutoff times (e.g., *"Order within 2h 15m to receive by Wednesday, Oct 21"*).
- Same-Day Dispatch Urgency: Motivates customers to finalize their orders before the daily shipping cutoff.
- Configurable in settings: order cutoff hour, transit days, business days only (Monday–Friday), and custom dispatch badge.

### WhatsApp Direct Cart Recovery
- Pre-formats the customer's cart items, quantities, subtotal, and unlocked perks into a WhatsApp message link.
- Ideal for international markets (Latin America, Europe, Middle East, India, Southeast Asia) where customers prefer direct messaging or Cash on Delivery confirmation.

### Time-Sensitive Exit-Intent Cart Saver
- Detects exit cursor intent toward tab closure or navigation.
- Prompts shoppers with a 10-minute expiring coupon code (`SAVE10PULSE`), applicable with a single click.

### Built-in Smart Conversion Copywriter
- Generates tailored threshold headlines, micro-copy, and WhatsApp follow-up greetings calibrated to your store's niche (Skincare, Artisanal Leather, Horology, Specialty Coffee, Apparel).

### One-Click WordPress Plugin Exporter
- Packages the entire solution into a clean, installable `.zip` archive (`woopulse-cart-booster.zip`).
- Follows WordPress coding standards: uses `wp_nonce_field`, output escaping (`esc_html`, `esc_attr`), and WooCommerce hooks (`woocommerce_add_to_cart_fragments`).

---

## Feature Comparison

| Feature | Default WooCommerce | Typical 5-Plugin Stack | Expensive SaaS Tools | WooPulse Pro |
| :--- | :---: | :---: | :---: | :---: |
| Slide-out mini-cart | No (full page reload) | Yes (heavy jQuery) | Yes | Yes (pure vanilla JS) |
| Dynamic 3-tier reward ladder | No | Yes (separate plugin) | Partial | Yes (built-in) |
| In-cart complementary bumps | No | Yes (separate plugin) | Yes | Yes (context-aware) |
| Point-of-checkout fee bumps | No | Complex / Custom code | Partial | Yes (native WC fee hooks) |
| WhatsApp direct checkout link | No | Yes (extra plugin) | No | Yes (pre-formatted) |
| Estimated delivery countdown | No | Yes (separate plugin) | Partial | Yes (local store hours) |
| Exit-intent recovery modal | No | Yes (extra plugin) | Yes | Yes (with countdown) |
| Script payload | 0 KB | 450 KB - 700 KB | 250 KB - 400 KB | Under 10 KB |
| Annual recurring cost | Free | $150 - $350 / yr | $299 - $499 / yr | Free / Open Source |

---

## Repository Structure

```text
├── server.ts                    # Express backend with copy optimization route & Vite middleware
├── src/
│   ├── assets/images/           # High-resolution catalog product photography
│   ├── components/
│   │   ├── Header.tsx           # Clean top navigation
│   │   ├── StorefrontView.tsx   # Interactive storefront catalog & quick preview modal
│   │   ├── CartDrawer.tsx       # Mini-cart drawer, reward progress bar, & order bumps
│   │   ├── ExitIntentModal.tsx  # Time-sensitive exit recovery modal
│   │   ├── StickyAddToCartBar.tsx # Mobile-friendly floating purchase bar
│   │   ├── CustomizerView.tsx   # Settings studio for thresholds, colors, and copy
│   │   ├── MarketInsightsView.tsx # Search trends analysis & revenue lift calculator
│   │   └── PluginExporterView.tsx # Code viewer and 1-click ZIP builder
│   ├── data/
│   │   └── mockProducts.ts      # Product catalog and complementary upsell pairings
│   ├── types/
│   │   └── index.ts             # TypeScript definitions for store, cart, and plugin config
│   ├── utils/
│   │   └── generatePluginCode.ts # Generator for PHP, JS, CSS, readme.txt, and ZIP download
│   ├── App.tsx                  # Master application state orchestration
│   ├── index.css                # Base stylesheet and transitions
│   └── main.tsx                 # React entry point
├── metadata.json                # Application metadata
├── package.json                 # Dependencies and build scripts
└── tsconfig.json                # TypeScript configuration
```

---

## Local Development

### Requirements
- Node.js 18 or newer
- npm or yarn

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Tayyabaakmal/WooPulse-Smart-WooCommerce-Cart-Conversion-Suite.git
   cd WooPulse-Smart-WooCommerce-Cart-Conversion-Suite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure optional environment variables:
   Create a `.env` file in the project root:
   ```env
   PORT=3000
   GEMINI_API_KEY="your-api-key-here"
   ```
   *(If no API key is specified, the application uses built-in high-converting copy algorithms).*

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

## Installing the Generated Plugin in WordPress

1. In the WooPulse application, go to the **WordPress Export & Code** tab and click **Download Plugin .ZIP**.
2. Log in to your WordPress dashboard (`/wp-admin`).
3. Navigate to **Plugins > Add New > Upload Plugin**.
4. Choose the downloaded `woopulse-cart-booster.zip` file and click **Install Now**.
5. Click **Activate Plugin**.
6. Navigate to **WooCommerce > WooPulse Booster** to configure your milestone amounts, brand colors, and WhatsApp phone number.

---

## Code Quality and Security

- **Strict Nonce Checks:** All admin form submissions and AJAX callbacks require valid WordPress nonces (`wp_nonce_field`, `check_admin_referer`).
- **Input Sanitization and Output Escaping:** Every dynamic string is processed with `esc_html`, `esc_attr`, or `esc_url`.
- **Zero Database Table Bloat:** Configuration options are stored in the core WordPress options table (`woopulse_settings`) without creating custom SQL tables.
- **Standards Compliant:** Tested with WordPress 5.8 through 6.7+ and WooCommerce 5.0 through 9.3+.

---

## Author & Credits

**Tayyaba Akmal**  
GitHub: [@tayyabaakmal](https://github.com/tayyabaakmal)  
Project: Lead Architect & Developer of WooPulse Pro  

---

## License

This project is open-source software licensed under the **GPL-2.0-or-later** license, matching WordPress and WooCommerce ecosystem standards.
