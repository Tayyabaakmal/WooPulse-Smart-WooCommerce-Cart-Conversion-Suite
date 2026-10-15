import React from 'react';
import { ActiveTab, PluginConfig } from '../types';
import { downloadPluginZip } from '../utils/generatePluginCode';
import { Download, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  config: PluginConfig;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  config,
  cartCount,
  onOpenCart,
}) => {
  const handleDownload = async () => {
    try {
      await downloadPluginZip(config);
    } catch (e) {
      console.error('Failed to download plugin zip', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
              WooPulse <span className="text-emerald-600 font-sans text-xs uppercase tracking-wider font-semibold">Pro</span>
            </span>
          </div>

          {/* Zone 2: 4 concise single-line nav tabs */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'simulator'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              Live Storefront Simulator
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
              Plugin Customizer
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
              Market Insights & Demand
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

          {/* Zone 3: 1 primary action + mini-cart trigger */}
          <div className="flex items-center gap-3 shrink-0">
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

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Plugin .ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-2 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
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
          onClick={() => setActiveTab('insights')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'insights' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('exporter')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'exporter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : ''}`}
        >
          Code & Zip
        </button>
      </div>
    </header>
  );
};
