import { useState, useEffect } from 'react';
import { returnsApi, brands as brandsApi, today } from '../api';

export default function Returns() {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addBrand, setAddBrand] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([returnsApi.list(date), brandsApi.list()])
      .then(([r, b]) => {
        setRows(r);
        setBrands(b);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), [date]);

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!addBrand) return;
    returnsApi.add({ brand_id: Number(addBrand), date, bottles_returned: Number(addQty) || 1 })
      .then(() => { setAddBrand(''); setAddQty(1); load(); })
      .catch((err) => setError(err.message));
  };

  const updateQty = (brand_id, bottles_returned) => {
    returnsApi.set({ brand_id, date, bottles_returned }).then(load).catch((err) => setError(err.message));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Returns</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="card">
        <h3>Record bottles returned</h3>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <label>
              Brand
              <select value={addBrand} onChange={(e) => setAddBrand(e.target.value)}>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label>
              Bottles returned
              <input type="number" className="input-num" min="1" value={addQty} onChange={(e) => setAddQty(Number(e.target.value) || 1)} />
            </label>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}
        </form>
      </div>

      <div className="card">
        <h3>Returns for {date}</h3>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <p>No returns recorded for this day.</p>
            <p>Use the form above to add bottles returned per brand.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Bottles returned</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.brand_name}</td>
                    <td>{r.category || '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.bottles_returned}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => updateQty(r.brand_id, Math.max(0, r.bottles_returned - 1))}>−</button>
                      <button className="btn btn-ghost" onClick={() => updateQty(r.brand_id, r.bottles_returned + 1)}>+</button>
                    </td>
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
