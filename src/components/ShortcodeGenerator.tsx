import React, { useState } from 'react';
import { PluginConfig } from '../types';
import { Copy, Check, Code, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface ShortcodeGeneratorProps {
  config: PluginConfig;
}

export const ShortcodeGenerator: React.FC<ShortcodeGeneratorProps> = ({ config }) => {
  const [styleMode, setStyleMode] = useState<'drawer' | 'floating_trigger' | 'sticky_bar' | 'progress_only'>('drawer');
  const [threshold, setThreshold] = useState<number>(config.tier1Threshold);
  const [showBumps, setShowBumps] = useState<boolean>(true);
  const [showWhatsApp, setShowWhatsApp] = useState<boolean>(true);
  const [activeOutputTab, setActiveOutputTab] = useState<'shortcode' | 'php' | 'gutenberg'>('shortcode');
  const [copied, setCopied] = useState(false);

  // Generate dynamic snippets
  const shortcode = `[woopulse_cart style="${styleMode}" threshold="${threshold}" bumps="${showBumps ? 'yes' : 'no'}" whatsapp="${showWhatsApp ? 'yes' : 'no'}" currency="${config.currencySymbol}"]`;

  const phpSnippet = `<?php
/**
 * WooPulse Custom Hook Placement
 * Paste into single-product.php, header.php, or custom template
 */
if (function_exists('woopulse_render_widget')) {
    woopulse_render_widget(array(
        'style'         => '${styleMode}',
        'tier1'         => ${threshold},
        'show_bumps'    => ${showBumps ? 'true' : 'false'},
        'show_whatsapp' => ${showWhatsApp ? 'true' : 'false'},
        'accent'        => '${config.accentColor}',
    ));
}
?>`;

  const gutenbergSnippet = `<!-- wp:shortcode -->
${shortcode}
<!-- /wp:shortcode -->`;

  const currentCode =
    activeOutputTab === 'shortcode'
      ? shortcode
      : activeOutputTab === 'php'
      ? phpSnippet
      : gutenbergSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Interactive Shortcode & Gutenberg Block Generator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Embed WooPulse widgets into any WordPress page, Elementor layout, or block editor container.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          WordPress 5.8 – 6.7+ Ready
        </span>
      </div>

      {/* Options Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Style Selector */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-800">Widget Layout Mode</label>
          <select
            value={styleMode}
            onChange={e => setStyleMode(e.target.value as unknown as typeof styleMode)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="drawer">Slide-Out AJAX Drawer</option>
            <option value="floating_trigger">Floating Cart Bag Trigger</option>
            <option value="sticky_bar">Sticky Add to Cart Bar</option>
            <option value="progress_only">Inline Milestone Progress Bar</option>
          </select>
        </div>

        {/* Free Shipping Threshold */}
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-800">Milestone Threshold ({config.currencySymbol})</label>
          <input
            type="number"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800 focus:bg-white"
          />
        </div>

        {/* Order Bumps Toggle */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showBumps}
              onChange={e => setShowBumps(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
            />
            <span className="font-medium text-slate-700">Include Order Bumps</span>
          </label>
        </div>

        {/* WhatsApp Recovery Toggle */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showWhatsApp}
              onChange={e => setShowWhatsApp(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
            />
            <span className="font-medium text-slate-700">Include WhatsApp Action</span>
          </label>
        </div>
      </div>

      {/* Code Output Panel */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveOutputTab('shortcode')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeOutputTab === 'shortcode'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Shortcode [woopulse_cart]
            </button>
            <button
              type="button"
              onClick={() => setActiveOutputTab('gutenberg')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeOutputTab === 'gutenberg'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gutenberg Block HTML
            </button>
            <button
              type="button"
              onClick={() => setActiveOutputTab('php')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeOutputTab === 'php'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PHP Template Tag
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>

      {/* Integration Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500 pt-1">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>Compatible with Elementor, Divi, Bricks, and Beaver Builder</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>No shortcode styling conflicts with core theme CSS</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>Updates automatically when WooCommerce cart changes</span>
        </div>
      </div>
    </div>
  );
};
