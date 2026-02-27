const KEYS = {
  ESTIMATE: 'lv_estimate',
  PRICES: 'lv_prices',
  COMPANY: 'lv_company',
  HEADER: 'lv_header',
};

/* ── Estimate ─────────────────────────────── */

export function loadEstimate() {
  try {
    const raw = localStorage.getItem(KEYS.ESTIMATE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveEstimate(state) {
  try {
    localStorage.setItem(KEYS.ESTIMATE, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save estimate', e);
  }
}

export function clearEstimate() {
  localStorage.removeItem(KEYS.ESTIMATE);
}

/* ── Prices ───────────────────────────────── */

export function loadPrices() {
  try {
    const raw = localStorage.getItem(KEYS.PRICES);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePrices(prices) {
  try {
    localStorage.setItem(KEYS.PRICES, JSON.stringify(prices));
  } catch (e) {
    console.warn('Failed to save prices', e);
  }
}

/* ── Company ──────────────────────────────── */

export function loadCompany() {
  return localStorage.getItem(KEYS.COMPANY) || '';
}

export function saveCompany(name) {
  localStorage.setItem(KEYS.COMPANY, name);
}

/* ── Header Image ─────────────────────────── */

export function loadHeader() {
  return localStorage.getItem(KEYS.HEADER) || null;
}

export function saveHeader(base64) {
  try {
    localStorage.setItem(KEYS.HEADER, base64);
  } catch (e) {
    console.warn('Header image too large for localStorage', e);
  }
}

export function removeHeader() {
  localStorage.removeItem(KEYS.HEADER);
}
