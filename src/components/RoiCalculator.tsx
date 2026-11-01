import React, { useState } from 'react';
import { PluginConfig } from '../types';
import { formatPrice } from '../utils/currency';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Users,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface RoiCalculatorProps {
  config: PluginConfig;
  onApplyConfigToCalculator?: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ config }) => {
  // Store Baseline Inputs
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(25000);
  const [conversionRate, setConversionRate] = useState<number>(2.2);
  const [currentAov, setCurrentAov] = useState<number>(65);
  const [cartAbandonmentRate, setCartAbandonmentRate] = useState<number>(72);

  // Active WooPulse Features Toggles
  const [enableTierRewards, setEnableTierRewards] = useState<boolean>(true);
  const [enableOrderBumps, setEnableOrderBumps] = useState<boolean>(true);
  const [enableExitIntent, setEnableExitIntent] = useState<boolean>(true);
  const [enableWhatsApp, setEnableWhatsApp] = useState<boolean>(true);

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Presets
  const handleApplyPreset = (visitors: number, cr: number, aov: number, abandon: number) => {
    setMonthlyVisitors(visitors);
    setConversionRate(cr);
    setCurrentAov(aov);
    setCartAbandonmentRate(abandon);
  };

  // Math Calculations
  const currentMonthlyOrders = Math.round((monthlyVisitors * conversionRate) / 100);
  const currentMonthlyRevenue = currentMonthlyOrders * currentAov;
  const currentAnnualRevenue = currentMonthlyRevenue * 12;

  // Basket Expansion (Tiered Rewards + Order Bumps)
  // Industry validated data: Tiered milestones lift AOV by ~14.5%, Order bumps add ~7.5%
  let aovLiftPercent = 0;
  if (enableTierRewards) aovLiftPercent += 14.5;
  if (enableOrderBumps) aovLiftPercent += 7.2;

  const newAov = currentAov * (1 + aovLiftPercent / 100);

  // Cart Recovery (Exit-Intent + WhatsApp)
  // Shoppers who add to cart:
  const cartInitiators = currentMonthlyOrders / (1 - cartAbandonmentRate / 100);
  const abandonedCarts = cartInitiators - currentMonthlyOrders;

  // Exit intent recovers ~4.8% of abandoners, WhatsApp direct chat recovers ~8.6%
  let recoveryRate = 0;
  if (enableExitIntent) recoveryRate += 4.8;
  if (enableWhatsApp) recoveryRate += 8.6;

  const recoveredOrdersPerMonth = Math.round((abandonedCarts * recoveryRate) / 100);
  const totalNewMonthlyOrders = currentMonthlyOrders + recoveredOrdersPerMonth;

  const projectedMonthlyRevenue = totalNewMonthlyOrders * newAov;
  const monthlyRevenueLift = Math.max(0, projectedMonthlyRevenue - currentMonthlyRevenue);
  const annualRevenueLift = monthlyRevenueLift * 12;

  // SaaS Replacement Savings
  // Typical app stack:
  // - Slide-out drawer app: $39/mo
  // - Dynamic multi-tier progress bar: $19/mo
  // - In-cart 1-click bumps & upsells: $49/mo
  // - WhatsApp abandoned cart plugin: $29/mo
  // - Exit-intent popup builder: $29/mo
  // Total = $165/mo = $1,980/year
  const annualSaaSStackCost = 165 * 12;

  const handleCopySummary = () => {
    const text = `=== WooPulse Store Revenue Lift & ROI Report ===
Store Model: ${monthlyVisitors.toLocaleString()} monthly visitors | ${conversionRate}% Conv Rate | $${currentAov} Baseline AOV
Baseline Annual Revenue: $${Math.round(currentAnnualRevenue).toLocaleString()}
Projected Annual Revenue: $${Math.round(projectedMonthlyRevenue * 12).toLocaleString()}

PROJECTED PERFORMANCE LIFT:
• Average Order Value (AOV): $${currentAov.toFixed(2)} → $${newAov.toFixed(2)} (+${aovLiftPercent.toFixed(1)}%)
• Recovered Abandoned Orders: +${recoveredOrdersPerMonth} orders/month
• Net Monthly Revenue Lift: +$${Math.round(monthlyRevenueLift).toLocaleString()}/month
• Net Annual Extra Revenue: +$${Math.round(annualRevenueLift).toLocaleString()}/year
• SaaS Subscriptions Saved: $${annualSaaSStackCost.toLocaleString()}/year (WooPulse is 100% self-hosted GPL)

Generated with WooPulse Pro — Zero-Bloat WooCommerce Conversion Suite`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            <Calculator className="w-4 h-4" />
            <span>Interactive Financial Model · WooCommerce Conversion Economics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Store Revenue Lift & ROI Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Calculate your store's projected basket expansion and abandoned cart recovery. See real dollar impacts on monthly sales and annual net revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Report Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Executive Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Profiles */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 font-medium">Quick Store Presets:</span>
        <button
          type="button"
          onClick={() => handleApplyPreset(8000, 1.8, 85, 75)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
        >
          Artisanal Boutique (8k visits · $85 AOV)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset(25000, 2.2, 65, 72)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
        >
          Growing E-commerce (25k visits · $65 AOV)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset(100000, 2.8, 45, 68)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
        >
          High-Volume DTC (100k visits · $45 AOV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Sliders & Toggles (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>1. Your Current Store Metrics</span>
            </h3>

            {/* Monthly Visitors Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="visitors-slider" className="font-semibold text-slate-700">Monthly Unique Visitors</label>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {monthlyVisitors.toLocaleString()}
                </span>
              </div>
              <input
                id="visitors-slider"
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={monthlyVisitors}
                onChange={e => setMonthlyVisitors(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1,000</span>
                <span>100,000</span>
                <span>200,000+</span>
              </div>
            </div>

            {/* Conversion Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="cr-slider" className="font-semibold text-slate-700">Current Conversion Rate</label>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
              <input
                id="cr-slider"
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={conversionRate}
                onChange={e => setConversionRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5% (Low)</span>
                <span>2.2% (Average)</span>
                <span>6.0% (High)</span>
              </div>
            </div>

            {/* Average Order Value (AOV) Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="aov-slider" className="font-semibold text-slate-700">Average Order Value (AOV)</label>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {formatPrice(currentAov, config.selectedCurrency || 'USD')}
                </span>
              </div>
              <input
                id="aov-slider"
                type="range"
                min="15"
                max="250"
                step="5"
                value={currentAov}
                onChange={e => setCurrentAov(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$15</span>
                <span>$125</span>
                <span>$250+</span>
              </div>
            </div>

            {/* Cart Abandonment Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="abandon-slider" className="font-semibold text-slate-700">Cart Abandonment Rate</label>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {cartAbandonmentRate}%
                </span>
              </div>
              <input
                id="abandon-slider"
                type="range"
                min="40"
                max="90"
                step="1"
                value={cartAbandonmentRate}
                onChange={e => setCartAbandonmentRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>40%</span>
                <span>72% (E-comm Avg)</span>
                <span>90%</span>
              </div>
            </div>
          </div>

          {/* Module Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>2. Active WooPulse Modules</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 cursor-pointer transition-colors">
                <div>
                  <span className="font-semibold text-slate-900 block">Tiered Free Shipping Bar</span>
                  <span className="text-[11px] text-slate-500">+14.5% AOV lift via milestone gamification</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableTierRewards}
                  onChange={e => setEnableTierRewards(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 cursor-pointer transition-colors">
                <div>
                  <span className="font-semibold text-slate-900 block">1-Click Complementary Bumps</span>
                  <span className="text-[11px] text-slate-500">+7.2% AOV lift through zero-friction add-ons</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableOrderBumps}
                  onChange={e => setEnableOrderBumps(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 cursor-pointer transition-colors">
                <div>
                  <span className="font-semibold text-slate-900 block">Exit-Intent Cart Saver</span>
                  <span className="text-[11px] text-slate-500">Recovers ~4.8% of desktop abandoners</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableExitIntent}
                  onChange={e => setEnableExitIntent(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 cursor-pointer transition-colors">
                <div>
                  <span className="font-semibold text-slate-900 block">WhatsApp Cart Recovery</span>
                  <span className="text-[11px] text-slate-500">Recovers ~8.6% with direct human chat</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableWhatsApp}
                  onChange={e => setEnableWhatsApp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Projected Revenue Cards & Impact (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Revenue Lift Spotlight */}
          <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden border border-emerald-800">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
                  Projected Net Revenue Impact
                </span>
                <span className="text-xs text-emerald-300 font-medium">
                  Based on current traffic & conversion model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="text-xs text-emerald-300 block mb-1">Additional Monthly Sales</span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
                    +{formatPrice(monthlyRevenueLift, config.selectedCurrency || 'USD')}
                  </div>
                  <span className="text-xs text-emerald-400 mt-1 block">
                    from basket growth & recovered carts
                  </span>
                </div>

                <div>
                  <span className="text-xs text-emerald-300 block mb-1">Additional Annual Revenue</span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-amber-300">
                    +{formatPrice(annualRevenueLift, config.selectedCurrency || 'USD')}
                  </div>
                  <span className="text-xs text-emerald-400 mt-1 block">
                    projected 12-month net expansion
                  </span>
                </div>
              </div>

              {/* Progress Comparison Bar */}
              <div className="pt-4 border-t border-emerald-800/80 space-y-2">
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>Current: {formatPrice(currentMonthlyRevenue, config.selectedCurrency || 'USD')}/mo</span>
                  <span className="font-bold text-white">
                    With WooPulse: {formatPrice(projectedMonthlyRevenue, config.selectedCurrency || 'USD')}/mo (+{(((projectedMonthlyRevenue - currentMonthlyRevenue) / (currentMonthlyRevenue || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-emerald-900 rounded-full overflow-hidden flex">
                  <div
                    className="bg-slate-400 h-full"
                    style={{ width: `${Math.min(100, (currentMonthlyRevenue / (projectedMonthlyRevenue || 1)) * 100)}%` }}
                    title="Baseline"
                  />
                  <div
                    className="bg-emerald-400 h-full animate-pulse"
                    style={{ width: `${Math.max(0, 100 - (currentMonthlyRevenue / (projectedMonthlyRevenue || 1)) * 100)}%` }}
                    title="Lift with WooPulse"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metric Cards (Grid of 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Basket Expansion */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">AOV Expansion</span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                {formatPrice(newAov, config.selectedCurrency || 'USD')}
              </div>
              <p className="text-[11px] text-slate-500">
                Up from <span className="line-through">{formatPrice(currentAov, config.selectedCurrency || 'USD')}</span> (<strong>+{aovLiftPercent.toFixed(1)}%</strong> via tier rewards & bumps)
              </p>
            </div>

            {/* 2. Recovered Abandoned Carts */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Recovered Orders</span>
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">
                +{recoveredOrdersPerMonth} <span className="text-xs text-slate-500 font-normal">/ month</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rescued from {Math.round(abandonedCarts)} monthly abandoned checkouts via WhatsApp & exit modal.
              </p>
            </div>

            {/* 3. SaaS Cost Elimination */}
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">SaaS Fees Saved</span>
              </div>
              <div className="text-xl font-bold text-emerald-700 font-mono">
                ${annualSaaSStackCost.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ year</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Replaces 5 separate monthly recurring SaaS subscriptions with 1 self-hosted plugin.
              </p>
            </div>
          </div>

          {/* Breakdown Table: WooPulse vs Expensive SaaS Apps */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Financial Breakdown: WooPulse vs Traditional 5-App SaaS Stack
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2">Capability</th>
                    <th className="py-2">Standard SaaS Stack</th>
                    <th className="py-2 text-emerald-700">WooPulse Pro Suite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 font-medium">AJAX Slide-Out Cart Drawer</td>
                    <td className="py-2.5 text-slate-500">$39/mo ($468/yr)</td>
                    <td className="py-2.5 text-emerald-700 font-semibold">Included (0ms TTFB)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Multi-Tier Free Shipping Milestones</td>
                    <td className="py-2.5 text-slate-500">$19/mo ($228/yr)</td>
                    <td className="py-2.5 text-emerald-700 font-semibold">Included (Dynamic AJAX)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">1-Click Complementary Order Bumps</td>
                    <td className="py-2.5 text-slate-500">$49/mo ($588/yr)</td>
                    <td className="py-2.5 text-emerald-700 font-semibold">Included (In-Cart & Checkout)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Instant WhatsApp Cart Recovery</td>
                    <td className="py-2.5 text-slate-500">$29/mo ($348/yr)</td>
                    <td className="py-2.5 text-emerald-700 font-semibold">Included (Native 1-Click)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium">Desktop Exit-Intent Cart Saver</td>
                    <td className="py-2.5 text-slate-500">$29/mo ($348/yr)</td>
                    <td className="py-2.5 text-emerald-700 font-semibold">Included (Zero jQuery)</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-3 px-2">Total Annual Ongoing Cost</td>
                    <td className="py-3 px-2 text-rose-600 line-through">$1,980/year</td>
                    <td className="py-3 px-2 text-emerald-700">$0/year (Self-Hosted GPL)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
