import { Router } from 'express';
import db from '../db.js';

const router = Router();

function today() {
  return new Date().toISOString().slice(0, 10);
}

router.get('/summary', (req, res) => {
  try {
    const { date, brand_id } = req.query;
    const d = date || today();
    const bid = brand_id ? parseInt(brand_id, 10) : null;

    const totalBottlesSold = bid
      ? db.prepare('SELECT COALESCE(SUM(bottles_sold), 0) as total FROM daily_sales WHERE date = ? AND brand_id = ?').get(d, bid)
      : db.prepare('SELECT COALESCE(SUM(bottles_sold), 0) as total FROM daily_sales WHERE date = ?').get(d);
    const totalReturns = bid
      ? db.prepare('SELECT COALESCE(SUM(bottles_returned), 0) as total FROM daily_returns WHERE date = ? AND brand_id = ?').get(d, bid)
      : db.prepare('SELECT COALESCE(SUM(bottles_returned), 0) as total FROM daily_returns WHERE date = ?').get(d);
    const totalStock = bid
      ? db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM stock WHERE brand_id = ?').get(bid)
      : db.prepare('SELECT COALESCE(SUM(quantity), 0) as total FROM stock').get();
    const brandCount = bid ? 1 : db.prepare('SELECT COUNT(*) as count FROM brands').get();
    const salesValue = bid
      ? db.prepare(`
          SELECT COALESCE(SUM(s.bottles_sold * b.price), 0) as total
          FROM daily_sales s JOIN brands b ON b.id = s.brand_id WHERE s.date = ? AND s.brand_id = ?
        `).get(d, bid)
      : db.prepare(`
          SELECT COALESCE(SUM(s.bottles_sold * b.price), 0) as total
          FROM daily_sales s JOIN brands b ON b.id = s.brand_id WHERE s.date = ?
        `).get(d);

    res.json({
      date: d,
      brand_id: bid || null,
      totalBottlesSold: totalBottlesSold?.total ?? 0,
      totalReturns: totalReturns?.total ?? 0,
      totalStock: totalStock?.total ?? 0,
      brandCount: brandCount?.count ?? (bid ? 1 : 0),
      totalSalesValue: salesValue?.total ?? 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/recent-sales', (req, res) => {
  try {
    const { from, to, brand_id } = req.query;
    const end = to || today();
    let start = from;
    if (!start) {
      const d = new Date(end);
      d.setDate(d.getDate() - 13);
      start = d.toISOString().slice(0, 10);
    }
    const bid = brand_id ? parseInt(brand_id, 10) : null;
    const limit = 90;

    const rows = bid
      ? db.prepare(`
          SELECT s.date, SUM(s.bottles_sold) as bottles_sold,
            COALESCE(SUM(s.bottles_sold * b.price), 0) as revenue
          FROM daily_sales s
          JOIN brands b ON b.id = s.brand_id
          WHERE s.date >= ? AND s.date <= ? AND s.brand_id = ?
          GROUP BY s.date
          ORDER BY s.date DESC
          LIMIT ?
        `).all(start, end, bid, limit)
      : db.prepare(`
          SELECT s.date, SUM(s.bottles_sold) as bottles_sold,
            COALESCE(SUM(s.bottles_sold * b.price), 0) as revenue
          FROM daily_sales s
          JOIN brands b ON b.id = s.brand_id
          WHERE s.date >= ? AND s.date <= ?
          GROUP BY s.date
          ORDER BY s.date DESC
          LIMIT ?
        `).all(start, end, limit);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
