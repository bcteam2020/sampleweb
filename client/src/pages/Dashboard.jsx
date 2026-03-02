import { useState, useEffect } from 'react';
import { dashboard, today, brands as brandsApi } from '../api';

export default function Dashboard() {
  const [date, setDate] = useState(today());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(today());
  const [brandId, setBrandId] = useState('');
  const [brands, setBrands] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandsApi.list().then(setBrands).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const to = dateTo || date;
    const from = dateFrom || (() => {
      const d = new Date(to);
      d.setDate(d.getDate() - 13);
      return d.toISOString().slice(0, 10);
    })();
    Promise.all([
      dashboard.summary(date, brandId || undefined),
      dashboard.recentSales(from, to, brandId || undefined),
    ])
      .then(([s, r]) => {
        if (!cancelled) {
          setSummary(s);
          setRecent(r);
        }
      })
      .catch(() => { if (!cancelled) setSummary({}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date, dateFrom, dateTo, brandId]);

  if (loading && !summary) {
    return <div className="page-title">Loading…</div>;
  }

  const selectedBrand = brandId ? brands.find((b) => String(b.id) === String(brandId)) : null;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Dashboard</h1>
        <div className="card" style={{ marginBottom: 0, marginTop: '1rem' }}>
          <h3>Filters</h3>
          <div className="form-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Day summary (date)
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginLeft: 0 }} />
            </label>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sales from
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" style={{ marginLeft: 0 }} />
            </label>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sales to
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ marginLeft: 0 }} />
            </label>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Brand
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} style={{ minWidth: '160px', marginLeft: 0 }}>
                <option value="">All brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          </div>
          {selectedBrand && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Showing results for: <strong style={{ color: 'var(--text)' }}>{selectedBrand.name}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">₹{Number(summary?.totalSalesValue ?? 0).toFixed(2)}</div>
          <div className="label">Sales value {selectedBrand ? `(${selectedBrand.name})` : '(selected day)'}</div>
        </div>
        <div className="stat-card">
          <div className="value">{summary?.totalBottlesSold ?? 0}</div>
          <div className="label">Bottles sold {selectedBrand ? `(${selectedBrand.name})` : '(selected day)'}</div>
        </div>
        <div className="stat-card">
          <div className="value">{summary?.totalReturns ?? 0}</div>
          <div className="label">Returns {selectedBrand ? `(${selectedBrand.name})` : '(selected day)'}</div>
        </div>
        <div className="stat-card">
          <div className="value">{summary?.totalStock ?? 0}</div>
          <div className="label">{selectedBrand ? 'Stock (this brand)' : 'Total stock (all brands)'}</div>
        </div>
        <div className="stat-card">
          <div className="value">{summary?.brandCount ?? 0}</div>
          <div className="label">Brands</div>
        </div>
      </div>

      <div className="card">
        <h3>Sales by date {dateFrom ? `(${dateFrom} to ${dateTo})` : '(last 14 days)'} {selectedBrand ? `— ${selectedBrand.name}` : ''}</h3>
        {recent.length === 0 ? (
          <div className="empty-state">
            <p>No sales data yet.</p>
            <p>Record daily sales to see trends here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bottles sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.bottles_sold}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>₹{Number(row.revenue || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
