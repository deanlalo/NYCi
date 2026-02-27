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

const COMPANY_DEFAULTS = {
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
};

export function loadCompanyInfo() {
  try {
    const raw = localStorage.getItem(KEYS.COMPANY);
    if (!raw) return { ...COMPANY_DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...COMPANY_DEFAULTS, ...parsed };
  } catch {
    // migrate legacy string value
    const legacy = localStorage.getItem(KEYS.COMPANY);
    if (legacy && typeof legacy === 'string') {
      return { ...COMPANY_DEFAULTS, name: legacy };
    }
    return { ...COMPANY_DEFAULTS };
  }
}

export function saveCompanyInfo(info) {
  localStorage.setItem(KEYS.COMPANY, JSON.stringify(info));
}

/* legacy compat */
export function loadCompany() {
  return loadCompanyInfo().name;
}

export function saveCompany(name) {
  const info = loadCompanyInfo();
  info.name = name;
  saveCompanyInfo(info);
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
