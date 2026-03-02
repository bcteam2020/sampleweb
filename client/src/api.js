const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const brands = {
  list: () => request('/brands'),
  create: (body) => request('/brands', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/brands/${id}`, { method: 'DELETE' }),
};

export const stock = {
  list: () => request('/stock'),
  set: (brand_id, quantity) => request('/stock/set', { method: 'PUT', body: JSON.stringify({ brand_id, quantity }) }),
  adjust: (brand_id, quantity_delta) => request('/stock/adjust', { method: 'POST', body: JSON.stringify({ brand_id, quantity_delta }) }),
};

export const sales = {
  list: (date) => request(date ? `/sales?date=${date}` : '/sales'),
  byDateRange: (from, to) => request(`/sales/by-date-range?from=${from}&to=${to}`),
  add: (body) => request('/sales', { method: 'POST', body: JSON.stringify(body) }),
  set: (body) => request('/sales', { method: 'PUT', body: JSON.stringify(body) }),
};

export const returnsApi = {
  list: (date) => request(date ? `/returns?date=${date}` : '/returns'),
  add: (body) => request('/returns', { method: 'POST', body: JSON.stringify(body) }),
  set: (body) => request('/returns', { method: 'PUT', body: JSON.stringify(body) }),
};

export const dashboard = {
  summary: (date, brandId) => {
    let path = '/dashboard/summary';
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (brandId) params.set('brand_id', brandId);
    if (params.toString()) path += '?' + params.toString();
    return request(path);
  },
  recentSales: (from, to, brandId) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (brandId) params.set('brand_id', brandId);
    const q = params.toString();
    return request(q ? '/dashboard/recent-sales?' + q : '/dashboard/recent-sales');
  },
};

export function today() {
  return new Date().toISOString().slice(0, 10);
}
