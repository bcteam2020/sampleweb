import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id, s.brand_id, s.quantity, s.updated_at, b.name as brand_name, b.category, b.price
      FROM stock s
      JOIN brands b ON b.id = s.brand_id
      ORDER BY b.name
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/by-brand/:brandId', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT s.*, b.name as brand_name FROM stock s
      JOIN brands b ON b.id = s.brand_id WHERE s.brand_id = ?
    `).get(req.params.brandId);
    res.json(row || { quantity: 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/adjust', (req, res) => {
  try {
    const { brand_id, quantity_delta } = req.body;
    const existing = db.prepare('SELECT id, quantity FROM stock WHERE brand_id = ?').get(brand_id);
    const newQty = Math.max(0, (existing?.quantity ?? 0) + (quantity_delta ?? 0));
    if (existing) {
      db.prepare("UPDATE stock SET quantity = ?, updated_at = datetime('now') WHERE brand_id = ?").run(newQty, brand_id);
    } else {
      db.prepare('INSERT INTO stock (brand_id, quantity) VALUES (?, ?)').run(brand_id, newQty);
    }
    res.json({ brand_id, quantity: newQty });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/set', (req, res) => {
  try {
    const { brand_id, quantity } = req.body;
    const qty = Math.max(0, quantity ?? 0);
    const existing = db.prepare('SELECT id FROM stock WHERE brand_id = ?').get(brand_id);
    if (existing) {
      db.prepare("UPDATE stock SET quantity = ?, updated_at = datetime('now') WHERE brand_id = ?").run(qty, brand_id);
    } else {
      db.prepare('INSERT INTO stock (brand_id, quantity) VALUES (?, ?)').run(brand_id, qty);
    }
    res.json({ brand_id, quantity: qty });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
