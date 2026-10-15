import React, { useState } from 'react';
import { PluginConfig } from '../types';
import {
  generateWordPressPluginPHP,
  generateSnippetPHP,
  generatePluginJS,
  generatePluginCSS,
  downloadPluginZip,
} from '../utils/generatePluginCode';
import { Download, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

interface PluginExporterViewProps {
  config: PluginConfig;
}

export const PluginExporterView: React.FC<PluginExporterViewProps> = ({ config }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'php' | 'snippet' | 'js' | 'css'>('php');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const phpCode = generateWordPressPluginPHP(config);
  const snippetCode = generateSnippetPHP(config);
  const jsCode = generatePluginJS();
  const cssCode = generatePluginCSS(config);

  const currentCode =
    activeCodeTab === 'php'
      ? phpCode
      : activeCodeTab === 'snippet'
      ? snippetCode
      : activeCodeTab === 'js'
      ? jsCode
      : cssCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadPluginZip(config);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header and Download CTA */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Ready for Production · WordPress 5.8 to 6.7+ & WooCommerce 5.0 to 9.3+
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Export Your Complete WooCommerce Plugin
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Download the complete, installable <strong className="text-white">woopulse-cart-booster.zip</strong> archive.
            Upload directly to your WordPress site with zero configuration required.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2.5 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Building .ZIP...' : 'Download Plugin .ZIP'}</span>
        </button>
      </div>

      {/* Step by Step WordPress Installation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-xs font-bold text-slate-900">Download .ZIP File</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the download button above to get your custom configured <code className="text-slate-800">woopulse-cart-booster.zip</code>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="text-xs font-bold text-slate-900">Upload to WordPress</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            In your WP dashboard, navigate to <strong>Plugins &gt; Add New &gt; Upload Plugin</strong>, choose the file and click Install Now.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-xs font-bold text-slate-900">Activate & Profit</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click <strong>Activate Plugin</strong>. Your store immediately has dynamic rewards, AJAX cart drawer, and WhatsApp cart saving active!
          </p>
        </div>
      </div>

      {/* Code Viewer & Syntax Switcher */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {/* Tab strip */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveCodeTab('php')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCodeTab === 'php'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>woopulse-cart-booster.php</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('snippet')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCodeTab === 'snippet'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>functions.php Snippet</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('js')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCodeTab === 'js'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>woopulse-cart.js</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('css')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCodeTab === 'css'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>woopulse-cart.css</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-6 overflow-x-auto max-h-[520px]">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>

      {/* Security & Compatibility Specifications */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Enterprise Security & Architecture Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict WordPress nonce validation on all settings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Escaped outputs via <code className="text-slate-800">esc_html</code>, <code className="text-slate-800">esc_attr</code></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Respects standard WooCommerce currency formatting filters</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero database table bloat (uses core options API)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
