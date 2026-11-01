import React from 'react';
import { ActiveTab, PluginConfig } from '../types';
import { downloadPluginZip } from '../utils/generatePluginCode';
import { CURRENCIES, SupportedCurrency } from '../utils/currency';
import { Download, ShoppingBag, Globe } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  config: PluginConfig;
  cartCount: number;
  onOpenCart: () => void;
  onUpdateCurrency: (currency: SupportedCurrency) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  config,
  cartCount,
  onOpenCart,
  onUpdateCurrency,
}) => {
  const handleDownload = async () => {
    try {
      await downloadPluginZip(config);
    } catch (e) {
      console.error('Failed to download plugin zip', e);
    }
  };

  const currentCurrency = config.selectedCurrency || 'USD';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
              WooPulse <span className="text-emerald-600 font-sans text-xs uppercase tracking-wider font-semibold">Pro</span>
            </span>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'simulator'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Live Simulator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customizer')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'customizer'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Customizer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roi')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === 'roi'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'hover:text-slate-900'
              }`}
            >
              <span>ROI Calculator</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                NEW
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ab-benchmark')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'ab-benchmark'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              A/B Benchmark
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'insights'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Market Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exporter')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'exporter'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              WordPress Export & Code
            </button>
          </nav>

          {/* Zone 3: Multi-Currency Switcher + Cart Trigger + Download Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Multi-Currency Dropdown */}
            <div className="relative flex items-center">
              <label htmlFor="currency-select" className="sr-only">Store Currency</label>
              <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-colors border border-slate-200/60">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  id="currency-select"
                  value={currentCurrency}
                  onChange={e => onUpdateCurrency(e.target.value as SupportedCurrency)}
                  className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {Object.values(CURRENCIES).map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 text-slate-700 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 flex items-center justify-center"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Download Plugin Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="hidden sm:flex px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm whitespace-nowrap shrink-0 items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Plugin .ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="lg:hidden flex items-center gap-1 border-t border-slate-100 px-3 py-2 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'simulator' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Storefront
        </button>
        <button
          onClick={() => setActiveTab('customizer')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'customizer' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Customizer
        </button>
        <button
          onClick={() => setActiveTab('roi')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'roi' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : ''}`}
        >
          ROI Calculator
        </button>
        <button
          onClick={() => setActiveTab('ab-benchmark')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'ab-benchmark' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          A/B Benchmark
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'insights' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('exporter')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'exporter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Export & Shortcodes
        </button>
      </div>
    </header>
  );
};
