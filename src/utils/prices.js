import { loadPrices, savePrices } from './storage';

export const DEFAULT_PRICES = {
  Intercom: 850,
  'Access Point': 420,
  Data: 280,
  Camera: 650,
  Speaker: 310,
};

export function getPrices() {
  return loadPrices() || { ...DEFAULT_PRICES };
}

export function updatePrice(item, price) {
  const prices = getPrices();
  prices[item] = Number(price);
  savePrices(prices);
  return prices;
}

export const ITEM_TYPES = [
  { type: 'Intercom', icon: '🔔', label: 'Intercom' },
  { type: 'Access Point', icon: '📡', label: 'Access Point' },
  { type: 'Data', icon: '🔌', label: 'Data' },
  { type: 'Camera', icon: '📷', label: 'Camera' },
  { type: 'Speaker', icon: '🔊', label: 'Speaker' },
  { type: 'Custom', icon: '✏️', label: 'Custom' },
];

export function getItemPrice(item, prices) {
  if (item.type === 'Custom') return item.customPrice || 0;
  return prices[item.type] || 0;
}

export function getItemName(item) {
  if (item.type === 'Custom') return item.customName || 'Custom Item';
  return item.type;
}

export function getItemIcon(type) {
  const found = ITEM_TYPES.find((t) => t.type === type);
  return found ? found.icon : '✏️';
}

export function formatCurrency(amount) {
  return '$' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
