import React, { useState } from 'react';
import { PluginConfig } from '../types';
import { calculateDeliveryEstimate } from '../utils/deliveryCountdown';
import { Sliders, Sparkles, Wand2, Phone, Tag, Check, RefreshCw, Clock } from 'lucide-react';

interface CustomizerViewProps {
  config: PluginConfig;
  onChangeConfig: (newConfig: PluginConfig) => void;
  onOpenCartPreview: () => void;
}

export const CustomizerView: React.FC<CustomizerViewProps> = ({
  config,
  onChangeConfig,
  onOpenCartPreview,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [storeNiche, setStoreNiche] = useState('Luxury Artisanal Goods');
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  const handleUpdate = <K extends keyof PluginConfig>(key: K, value: PluginConfig[K]) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const handleOptimizeWithAI = async () => {
    setIsGeneratingAI(true);
    setAiSuccessMsg(null);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeNiche,
          targetAudience: 'High-intent online shoppers',
          currentCopy: config.exitIntentHeadline,
          goal: `$${config.tier1Threshold} for ${config.tier1Title}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.suggestions) {
        const s = data.suggestions;
        onChangeConfig({
          ...config,
          exitIntentHeadline: s.headline || config.exitIntentHeadline,
          bumpPitch: s.upsellPitch || config.bumpPitch,
          whatsAppMessageTemplate: s.whatsappMessage || config.whatsAppMessageTemplate,
        });
        setAiSuccessMsg('AI copy optimized and applied to settings successfully!');
        setTimeout(() => setAiSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('AI optimization error:', e);
      // Fallback update
      onChangeConfig({
        ...config,
        exitIntentHeadline: 'Wait! We reserved your items with VIP privileges',
        bumpPitch: 'Add handcrafted conditioning care balm for 25% off',
      });
      setAiSuccessMsg('Template copy applied!');
      setTimeout(() => setAiSuccessMsg(null), 3000);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Intro block */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            WooPulse Plugin Settings & Customizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure dynamic thresholds, WhatsApp recovery, and exit-intent rules. Changes reflect immediately in the Live Simulator.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCartPreview}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Test Live Cart</span>
        </button>
      </div>

      {/* AI Copy Generator Block */}
      <div className="p-5 bg-gradient-to-br from-emerald-50 via-slate-50 to-white rounded-2xl border border-emerald-200/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Smart Conversion Copywriter
              </h3>
              <p className="text-xs text-slate-500">
                Generate high-converting headlines tailored to your store niche.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={storeNiche}
              onChange={e => setStoreNiche(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Luxury Artisanal Goods">Luxury Artisanal Goods</option>
              <option value="Organic Botanical Skincare">Organic Skincare</option>
              <option value="Specialty Coffee & Roastery">Coffee & Roastery</option>
              <option value="Minimalist Horology & Watches">Minimalist Watches</option>
              <option value="Apparel & Streetwear">Apparel & Streetwear</option>
            </select>

            <button
              type="button"
              onClick={handleOptimizeWithAI}
              disabled={isGeneratingAI}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Optimize Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiSuccessMsg && (
          <div className="text-xs text-emerald-800 bg-emerald-100/80 px-3 py-2 rounded-lg flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{aiSuccessMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Dynamic Reward Progress Milestones */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Dynamic Reward Milestones</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableTieredRewards}
                onChange={e => handleUpdate('enableTieredRewards', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-1">
            {/* Tier 1 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Tier 1: Threshold ({config.currencySymbol})</span>
                <input
                  type="number"
                  value={config.tier1Threshold}
                  onChange={e => handleUpdate('tier1Threshold', Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-right tabular-nums bg-white font-mono"
                />
              </div>
              <input
                type="text"
                value={config.tier1Title}
                onChange={e => handleUpdate('tier1Title', e.target.value)}
                placeholder="Tier 1 label (e.g. Free Standard Shipping)"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
              />
            </div>

            {/* Tier 2 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Tier 2: Threshold ({config.currencySymbol})</span>
                <input
                  type="number"
                  value={config.tier2Threshold}
                  onChange={e => handleUpdate('tier2Threshold', Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-right tabular-nums bg-white font-mono"
                />
              </div>
              <input
                type="text"
                value={config.tier2Title}
                onChange={e => handleUpdate('tier2Title', e.target.value)}
                placeholder="Tier 2 label (e.g. Free Mystery Gift)"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
              />
            </div>

            {/* Tier 3 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Tier 3: Threshold ({config.currencySymbol})</span>
                <input
                  type="number"
                  value={config.tier3Threshold}
                  onChange={e => handleUpdate('tier3Threshold', Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-slate-300 rounded text-right tabular-nums bg-white font-mono"
                />
              </div>
              <input
                type="text"
                value={config.tier3Title}
                onChange={e => handleUpdate('tier3Title', e.target.value)}
                placeholder="Tier 3 label (e.g. 15% Off VIP Order)"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Cart Recovery & Direct Closing */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Direct Cart Recovery</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableWhatsAppRecovery}
                onChange={e => handleUpdate('enableWhatsAppRecovery', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                WhatsApp Business Phone (with Country Code)
              </label>
              <input
                type="text"
                value={config.whatsAppNumber}
                onChange={e => handleUpdate('whatsAppNumber', e.target.value)}
                placeholder="+1 555 382 9011"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Button Label in Cart Drawer</label>
              <input
                type="text"
                value={config.whatsAppButtonText}
                onChange={e => handleUpdate('whatsAppButtonText', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Default Message Header</label>
              <textarea
                rows={2}
                value={config.whatsAppMessageTemplate}
                onChange={e => handleUpdate('whatsAppMessageTemplate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Cart items, subtotal, and reward milestones are automatically appended by the plugin.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Exit-Intent Cart Saver */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Exit-Intent Rescue Modal</span>
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableExitIntent}
                onChange={e => handleUpdate('enableExitIntent', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Exit Headline</label>
              <input
                type="text"
                value={config.exitIntentHeadline}
                onChange={e => handleUpdate('exitIntentHeadline', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Discount %</label>
                <input
                  type="number"
                  value={config.exitIntentDiscountPercent}
                  onChange={e => handleUpdate('exitIntentDiscountPercent', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={config.exitIntentCouponCode}
                  onChange={e => handleUpdate('exitIntentCouponCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: In-Cart Complementary Upsells & Order Bumps */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Complementary Upsell Engine</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableOrderBump}
                onChange={e => handleUpdate('enableOrderBump', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Section Title</label>
              <input
                type="text"
                value={config.bumpHeading}
                onChange={e => handleUpdate('bumpHeading', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Bundle Discount (%)</label>
              <input
                type="number"
                value={config.bumpDiscountPercent}
                onChange={e => handleUpdate('bumpDiscountPercent', Number(e.target.value))}
                className="w-24 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Point-of-Checkout Priority Micro-Bumps */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Point-of-Checkout Priority Bumps</h3>
              <p className="text-xs text-slate-500">
                Frictionless checkboxes rendered in the cart drawer footer right above the checkout CTA button.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Protection Bump */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Priority Transit Guarantee</span>
                <input
                  type="checkbox"
                  checked={config.enableCheckoutProtectionBump}
                  onChange={e => handleUpdate('enableCheckoutProtectionBump', e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 accent-emerald-600"
                />
              </div>
              <input
                type="text"
                value={config.protectionBumpTitle}
                onChange={e => handleUpdate('protectionBumpTitle', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800"
              />
              <div className="flex items-center justify-between text-slate-600">
                <span>Fee Amount ($)</span>
                <input
                  type="number"
                  step="0.05"
                  value={config.protectionBumpPrice}
                  onChange={e => handleUpdate('protectionBumpPrice', Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-slate-200 rounded bg-white font-mono text-right"
                />
              </div>
            </div>

            {/* Gift Wrap Bump */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Handcrafted Gift Box Add-on</span>
                <input
                  type="checkbox"
                  checked={config.enableGiftBoxBump}
                  onChange={e => handleUpdate('enableGiftBoxBump', e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 accent-emerald-600"
                />
              </div>
              <input
                type="text"
                value={config.giftBoxBumpTitle}
                onChange={e => handleUpdate('giftBoxBumpTitle', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800"
              />
              <div className="flex items-center justify-between text-slate-600">
                <span>Fee Amount ($)</span>
                <input
                  type="number"
                  step="0.05"
                  value={config.giftBoxBumpPrice}
                  onChange={e => handleUpdate('giftBoxBumpPrice', Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-slate-200 rounded bg-white font-mono text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Estimated Delivery Countdown & Local Store Dispatch Hours */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-4 shadow-xs md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Estimated Delivery Countdown & Store Hours
                </h3>
                <p className="text-xs text-slate-500">
                  Calculates and displays a dynamic arrival date (e.g., "Order within 2h 15m to receive by Wednesday") based on daily order cutoff time.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.enableDeliveryCountdown}
                onChange={e => handleUpdate('enableDeliveryCountdown', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
            {/* Cutoff Time */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <label className="block font-semibold text-slate-900">Daily Cutoff Time</label>
              <p className="text-[11px] text-slate-500">Local store order processing cutoff</p>
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={config.cutoffHour}
                  onChange={e => handleUpdate('cutoffHour', Number(e.target.value))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono text-slate-800 text-xs focus:ring-1 focus:ring-slate-900"
                >
                  {Array.from({ length: 24 }).map((_, h) => {
                    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    return (
                      <option key={h} value={h}>
                        {hour12}:00 {ampm} ({String(h).padStart(2, '0')}:00)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Transit Days */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <label className="block font-semibold text-slate-900">Courier Transit Time</label>
              <p className="text-[11px] text-slate-500">Days required for transit</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={config.transitDays}
                  onChange={e => handleUpdate('transitDays', Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-mono text-slate-800 text-xs"
                />
                <span className="text-slate-600">business days</span>
              </div>
            </div>

            {/* Business Days Toggle & Badge Label */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <label className="flex items-center gap-2 font-semibold text-slate-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.businessDaysOnly}
                  onChange={e => handleUpdate('businessDaysOnly', e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 accent-emerald-600"
                />
                <span>Business Days Only (Mon–Fri)</span>
              </label>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Dispatch Badge Label</label>
                <input
                  type="text"
                  value={config.dispatchLabel}
                  onChange={e => handleUpdate('dispatchLabel', e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded bg-white text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Live Dynamic Preview Card */}
          {config.enableDeliveryCountdown && (
            <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-slate-700">
                  <strong>Live In-Cart Preview:</strong>{' '}
                  {calculateDeliveryEstimate(
                    config.cutoffHour,
                    config.cutoffMinute,
                    config.transitDays,
                    config.businessDaysOnly
                  ).fullMessage}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Dynamic Urgency Active
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
