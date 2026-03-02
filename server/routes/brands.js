import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM brands ORDER BY name').all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, category, price } = req.body;
    const p = Number(price) >= 0 ? Number(price) : 0;
    const result = db.prepare('INSERT INTO brands (name, category, price) VALUES (?, ?, ?)').run(name || '', category || '', p);
    res.status(201).json({ id: result.lastInsertRowid, name: name || '', category: category || '', price: p });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    const p = Number(price) >= 0 ? Number(price) : 0;
    db.prepare('UPDATE brands SET name = ?, category = ?, price = ? WHERE id = ?').run(name, category, p, id);
    res.json({ id: +id, name, category, price: p });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    // Remove related rows first (foreign keys)
    db.prepare('DELETE FROM daily_sales WHERE brand_id = ?').run(id);
    db.prepare('DELETE FROM daily_returns WHERE brand_id = ?').run(id);
    db.prepare('DELETE FROM stock WHERE brand_id = ?').run(id);
    db.prepare('DELETE FROM brands WHERE id = ?').run(id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
