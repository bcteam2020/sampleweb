import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import brandsRouter from './routes/brands.js';
import stockRouter from './routes/stock.js';
import salesRouter from './routes/sales.js';
import returnsRouter from './routes/returns.js';
import dashboardRouter from './routes/dashboard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/brands', brandsRouter);
app.use('/api/stock', stockRouter);
app.use('/api/sales', salesRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

// Resolve client/dist: from server/ go up to root then client/dist; also try cwd (Render may run from root)
function getClientDist() {
  const fromServer = join(__dirname, '..', 'client', 'dist');
  if (existsSync(fromServer)) return fromServer;
  const fromCwd = join(process.cwd(), 'client', 'dist');
  if (existsSync(fromCwd)) return fromCwd;
  const fromCwdServer = join(process.cwd(), '..', 'client', 'dist');
  if (existsSync(fromCwdServer)) return fromCwdServer;
  return null;
}

const clientDist = getClientDist();
if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (_, res, next) => {
    res.sendFile(join(clientDist, 'index.html'), (err) => err && next());
  });
  console.log('Serving frontend from', clientDist);
} else {
  console.warn('client/dist not found. Build the client before starting.');
  app.get('*', (_, res) => res.status(404).send('Frontend not built. Run: npm run build'));
}

app.listen(PORT, () => {
  console.log('Bluewave API running on port ' + PORT);
});
