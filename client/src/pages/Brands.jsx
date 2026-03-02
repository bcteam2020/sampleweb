import { useState, useEffect } from 'react';
import { brands as brandsApi } from '../api';

export default function Brands() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    brandsApi.list().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const priceNum = Math.max(0, Number(price) || 0);
    if (editing) {
      brandsApi.update(editing.id, { name: name.trim(), category: category.trim(), price: priceNum })
        .then(() => { setEditing(null); setName(''); setCategory(''); setPrice(''); load(); })
        .catch((err) => setError(err.message));
    } else {
      if (!name.trim()) return setError('Name is required');
      brandsApi.create({ name: name.trim(), category: category.trim(), price: priceNum })
        .then(() => { setName(''); setCategory(''); setPrice(''); load(); })
        .catch((err) => setError(err.message));
    }
  };

  const startEdit = (b) => {
    setEditing(b);
    setName(b.name);
    setCategory(b.category || '');
    setPrice(b.price != null ? b.price : '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setName('');
    setCategory('');
    setPrice('');
  };

  const formatPrice = (p) => (p != null && Number(p) > 0 ? `₹${Number(p).toFixed(2)}` : '—');

  const remove = (id) => {
    if (!confirm('Delete this brand? Stock/sales data for it may be affected.')) return;
    brandsApi.delete(id).then(load).catch((err) => setError(err.message));
  };

  return (
    <>
      <h1 className="page-title">Brands</h1>

      <div className="card">
        <h3>{editing ? 'Edit brand' : 'Add brand'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jack Daniel's" />
            </label>
            <label>
              Price per bottle (₹)
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1200" />
            </label>
            <label>
              Category
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Whiskey, Beer" />
            </label>
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error}</p>}
        </form>
      </div>

      <div className="card">
        <h3>All brands</h3>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <p>No brands yet.</p>
            <p>Add brands above to track stock and sales by bottle type.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price/bottle</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.category || '—'}</td>
                    <td>{formatPrice(b.price)}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ marginRight: '0.5rem' }} onClick={() => startEdit(b)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(b.id)}>Delete</button>
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
