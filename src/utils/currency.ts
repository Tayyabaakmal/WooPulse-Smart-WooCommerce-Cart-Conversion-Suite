export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyDetails {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rate: number; // exchange multiplier from USD base
  decimals: number;
  flag: string;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyDetails> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, decimals: 2, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, decimals: 2, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, decimals: 2, flag: '🇬🇧' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, decimals: 2, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 1.52, decimals: 2, flag: '🇦🇺' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 152.0, decimals: 0, flag: '🇯🇵' },
};

export function convertPrice(amountUSD: number, currency: SupportedCurrency): number {
  const curr = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amountUSD * curr.rate;
  return curr.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(curr.decimals));
}

export function formatPrice(amountUSD: number, currency: SupportedCurrency): string {
  const curr = CURRENCIES[currency] || CURRENCIES.USD;
  const value = convertPrice(amountUSD, currency);
  if (curr.decimals === 0) {
    return `${curr.symbol}${value.toLocaleString()}`;
  }
  return `${curr.symbol}${value.toFixed(curr.decimals)}`;
}

export function getScaledThreshold(thresholdUSD: number, currency: SupportedCurrency): number {
  const curr = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = thresholdUSD * curr.rate;
  // Round to friendly milestone numbers
  if (curr.code === 'JPY') {
    return Math.round(converted / 500) * 500;
  }
  return Math.round(converted / 5) * 5;
}
