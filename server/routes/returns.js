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
      SELECT r.id, r.brand_id, r.date, r.bottles_returned, b.name as brand_name, b.category
      FROM daily_returns r
      JOIN brands b ON b.id = r.brand_id
      WHERE r.date = ?
      ORDER BY b.name
    `).all(d);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { brand_id, date, bottles_returned } = req.body;
    const d = date || today();
    const count = bottles_returned ?? 0;
    const existing = db.prepare('SELECT id, bottles_returned FROM daily_returns WHERE brand_id = ? AND date = ?').get(brand_id, d);
    if (existing) {
      db.prepare('UPDATE daily_returns SET bottles_returned = bottles_returned + ? WHERE brand_id = ? AND date = ?').run(count, brand_id, d);
      const updated = db.prepare('SELECT * FROM daily_returns WHERE brand_id = ? AND date = ?').get(brand_id, d);
      return res.status(201).json(updated);
    }
    const result = db.prepare('INSERT INTO daily_returns (brand_id, date, bottles_returned) VALUES (?, ?, ?)').run(brand_id, d, count);
    res.status(201).json({ id: result.lastInsertRowid, brand_id, date: d, bottles_returned: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', (req, res) => {
  try {
    const { brand_id, date, bottles_returned } = req.body;
    const d = date || today();
    db.prepare(`
      INSERT INTO daily_returns (brand_id, date, bottles_returned) VALUES (?, ?, ?)
      ON CONFLICT(brand_id, date) DO UPDATE SET bottles_returned = ?
    `).run(brand_id, d, bottles_returned ?? 0, bottles_returned ?? 0);
    const row = db.prepare('SELECT * FROM daily_returns WHERE brand_id = ? AND date = ?').get(brand_id, d);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
