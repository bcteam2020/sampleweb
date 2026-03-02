import { Router } from 'express';
import db from '../db.js';

const router = Router();

function today() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/', (req, res) => {
  try {
    const { date } = req.query;
    const d = date || today();
    const rows = db.prepare(`
      SELECT s.id, s.brand_id, s.date, s.bottles_sold, b.name as brand_name, b.category, b.price
      FROM daily_sales s
      JOIN brands b ON b.id = s.brand_id
      WHERE s.date = ?
      ORDER BY b.name
    `).all(d);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/by-date-range', (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = db.prepare(`
      SELECT s.date, s.brand_id, s.bottles_sold, b.name as brand_name
      FROM daily_sales s
      JOIN brands b ON b.id = s.brand_id
      WHERE s.date >= ? AND s.date <= ?
      ORDER BY s.date DESC, b.name
    `).all(from || '2000-01-01', to || '2099-12-31');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { brand_id, date, bottles_sold } = req.body;
    const d = date || today();
    const count = bottles_sold ?? 0;
    const existing = db.prepare('SELECT id, bottles_sold FROM daily_sales WHERE brand_id = ? AND date = ?').get(brand_id, d);
    if (existing) {
      db.prepare('UPDATE daily_sales SET bottles_sold = bottles_sold + ? WHERE brand_id = ? AND date = ?').run(count, brand_id, d);
      const updated = db.prepare('SELECT * FROM daily_sales WHERE brand_id = ? AND date = ?').get(brand_id, d);
      return res.status(201).json(updated);
    }
    const result = db.prepare('INSERT INTO daily_sales (brand_id, date, bottles_sold) VALUES (?, ?, ?)').run(brand_id, d, count);
    res.status(201).json({ id: result.lastInsertRowid, brand_id, date: d, bottles_sold: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', (req, res) => {
  try {
    const { brand_id, date, bottles_sold } = req.body;
    const d = date || today();
    db.prepare(`
      INSERT INTO daily_sales (brand_id, date, bottles_sold) VALUES (?, ?, ?)
      ON CONFLICT(brand_id, date) DO UPDATE SET bottles_sold = ?
    `).run(brand_id, d, bottles_sold ?? 0, bottles_sold ?? 0);
    const row = db.prepare('SELECT * FROM daily_sales WHERE brand_id = ? AND date = ?').get(brand_id, d);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
