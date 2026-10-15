import React, { useState, useEffect } from 'react';
import { PluginConfig } from '../types';
import { X, Clock, Sparkles, Send } from 'lucide-react';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PluginConfig;
  onApplyAndOpenCart: () => void;
  subtotal: number;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({
  isOpen,
  onClose,
  config,
  onApplyAndOpenCart,
  subtotal,
}) => {
  const [timeLeft, setTimeLeft] = useState(config.exitIntentTimerMinutes * 60);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const cleanPhone = config.whatsAppNumber.replace(/[^0-9]/g, '') || '15553829011';
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
    `Hello! I was browsing your store and saw the exit offer ${config.exitIntentCouponCode}. Can you save my $${subtotal.toFixed(2)} cart for me?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="relative inline-block w-full max-w-md p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl transform transition-all border border-slate-100">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Special kicker */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cart Items Reserved Temporarily</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {config.exitIntentHeadline}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your selected items are in high demand and low stock. Complete your order within the next 10 minutes and receive an exclusive{' '}
            <strong className="text-slate-900">{config.exitIntentDiscountPercent}% discount</strong> on your entire purchase.
          </p>

          {/* Countdown timer */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Offer expires in:</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-700 tabular-nums">
              {formattedTime}
            </div>
          </div>

          {/* Coupon Code Block */}
          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Coupon Code</span>
              <p className="text-sm font-bold font-mono text-slate-900">{config.exitIntentCouponCode}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">-{config.exitIntentDiscountPercent}% Applied</span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={onApplyAndOpenCart}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Claim {config.exitIntentDiscountPercent}% Off & View Bag</span>
              <span>&rarr;</span>
            </button>

            {config.enableWhatsAppRecovery && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save Cart to WhatsApp Instead</span>
              </a>
            )}
          </div>

          <p className="mt-4 text-[11px] text-center text-slate-400">
            No credit card needed right now · Secure instant checkout
          </p>
        </div>
      </div>
    </div>
  );
};
