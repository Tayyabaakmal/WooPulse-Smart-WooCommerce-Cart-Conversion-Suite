# Changelog

All notable changes to **WooPulse Pro** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.1] - 2026-10-31

### Added
- **Shimmering Reward Progress Track (`CartDrawer.tsx`, `index.css`)**:
  - Continuous linear-gradient shimmer wave animation for reward milestone advancement.
  - Interactive milestone node pins (Tier 1 Free Shipping, Tier 2 Free Gift, Tier 3 VIP 15% Off) with micro-tooltips and nearing pulse rings.
  - Golden VIP celebratory gradient when maximum cart perks are unlocked.

## [1.1.0] - 2026-10-30

### Added
- **Interactive Store ROI & Revenue Lift Calculator (`RoiCalculator.tsx`)**:
  - Real-time financial modeling based on monthly revenue, current AOV, and conversion rates.
  - SaaS consolidation calculation showing $1,980/year in annual savings by replacing 5 redundant plugins.
  - Estimated net annual revenue expansion with breakdown of shipping unlock, order bumps, and cart recovery.
  - 1-Click Executive Summary generator formatted for merchant stakeholders.

- **A/B Split Testing Benchmark Simulator (`AbBenchmarkView.tsx`)**:
  - Live automated 500-shopper simulation engine comparing standard WooCommerce checkout vs. WooPulse Pro.
  - Statistical tracking of cart abandonment rate (74% vs 46%), AOV expansion (+19.4%), and total revenue output (+32.1%).
  - Configurable traffic presets (Flash Sale, High Intent, Cold Traffic) and animation speed controls.

- **Interactive WordPress Shortcode & Gutenberg Block Generator (`ShortcodeGenerator.tsx`)**:
  - Visual builder generating customized shortcodes (`[woopulse_cart layout="..." ...]`).
  - Production-ready Gutenberg block JSON and theme template action hooks (`do_action('woopulse_cart_render')`).
  - Instant copy-to-clipboard functionality with active validation.

- **Multi-Currency Live Switcher (`currency.ts`)**:
  - Native currency engine supporting USD ($), EUR (€), GBP (£), CAD (CA$), AUD (AU$), and JPY (¥).
  - Real-time price and threshold conversion across all cart items, order bumps, and milestone banners.

- **Milestone Audio & Particle Celebration Engine (`celebration.ts`)**:
  - Melodic Web Audio API tone synthesizer triggering chord progressions when reaching milestone reward tiers ($50, $100, $160).
  - Multi-stage confetti particle bursts via `canvas-confetti`.
  - Built-in audio toggle permitting users to mute or enable sound effects.

### Changed
- **Suite Navigation (`Header.tsx`, `App.tsx`)**:
  - Integrated dedicated navigation tabs for Storefront, Live Studio, Benchmark, ROI Calculator, Shortcode Builder, and Code Export.
  - Added live cart item badge and multi-currency selector directly in the main navigation.

- **Cart Drawer (`CartDrawer.tsx`)**:
  - Upgraded milestone calculation with currency-aware threshold formatting.
  - Added direct WhatsApp Cart Recovery link generation with encoded cart payloads.
  - Improved responsive layout for small mobile screens.

---

## [1.0.0] - 2026-10-16

### Added
- Dynamic 3-tier milestone spending ladder (Free Shipping, Mystery Gift, VIP 15% Discount).
- Instant AJAX slide-out mini-cart drawer with zero jQuery dependencies (<10KB payload).
- Complementary in-cart order bumps with 1-click addition and deduplication.
- Point-of-checkout priority fee add-ons (Priority Transit Guarantee, Gift Packaging).
- Dynamic Estimated Delivery Countdown calculated from local store cutoff hours.
- Time-sensitive exit-intent coupon saver modal.
- Standalone PHP WordPress plugin generator (`woopulse-pro.php`) and 1-click ZIP exporter.
- GitHub Actions CI workflow, MIT/GPL licensing, and setup documentation.

---

### Author & Sole Contributor
- **Tayyaba Akmal** ([@Tayyabaakmal](https://github.com/Tayyabaakmal))
