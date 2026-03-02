import { useState, useEffect } from 'react';
import { stock as stockApi, brands as brandsApi } from '../api';

export default function Stock() {
  const [stockList, setStockList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustBrand, setAdjustBrand] = useState('');
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [setQtyBrand, setSetQtyBrand] = useState('');
  const [setQty, setSetQty] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([stockApi.list(), brandsApi.list()])
      .then(([s, b]) => {
        setStockList(s);
        setBrands(b);
        const inStockIds = new Set(s.map((x) => x.brand_id));
        const missing = b.filter((x) => !inStockIds.has(x.id));
        setStockList((prev) => [
          ...prev,
          ...missing.map((m) => ({ brand_id: m.id, brand_name: m.name, category: m.category, price: m.price, quantity: 0 })),
        ].sort((a, b) => (a.brand_name || '').localeCompare(b.brand_name || '')));
      })
      .catch(() => setStockList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleAdjust = (e) => {
    e.preventDefault();
    setError('');
    if (!adjustBrand || adjustDelta === 0) return;
    stockApi.adjust(Number(adjustBrand), Number(adjustDelta))
      .then(() => { setAdjustBrand(''); setAdjustDelta(0); load(); })
      .catch((err) => setError(err.message));
  };

  const handleSetQty = (e) => {
    e.preventDefault();
    setError('');
    if (!setQtyBrand || setQty === '') return;
    stockApi.set(Number(setQtyBrand), Math.max(0, Number(setQty)))
      .then(() => { setSetQtyBrand(''); setSetQty(''); load(); })
      .catch((err) => setError(err.message));
  };

  return (
    <>
      <h1 className="page-title">Stock</h1>

      <div className="card">
        <h3>Adjust stock (add/remove bottles)</h3>
        <form onSubmit={handleAdjust}>
          <div className="form-row">
            <label>
              Brand
              <select value={adjustBrand} onChange={(e) => setAdjustBrand(e.target.value)}>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label>
              Change (+ or -)
              <input type="number" className="input-num" value={adjustDelta || ''} onChange={(e) => setAdjustDelta(Number(e.target.value) || 0)} />
            </label>
            <button type="submit" className="btn btn-primary">Apply</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Set exact quantity</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Use after a physical count to correct stock to a specific number of bottles.
        </p>
        <form onSubmit={handleSetQty}>
          <div className="form-row">
            <label>
              Brand
              <select value={setQtyBrand} onChange={(e) => setSetQtyBrand(e.target.value)}>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input type="number" className="input-num" min="0" value={setQty} onChange={(e) => setSetQty(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary">Set</button>
          </div>
        </form>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}
      </div>

      <div className="card">
        <h3>Current stock by brand</h3>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : stockList.length === 0 ? (
          <div className="empty-state">
            <p>No brands. Add brands first, then adjust stock.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price/bottle</th>
                  <th>Bottles in stock</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map((row) => (
                  <tr key={row.brand_id}>
                    <td>{row.brand_name}</td>
                    <td>{row.category || '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.price != null && Number(row.price) > 0 ? `₹${Number(row.price).toFixed(2)}` : '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{row.quantity}</td>
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
