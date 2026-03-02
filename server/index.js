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

// Serve built React app when client/dist exists (e.g. production)
const clientDist = join(__dirname, '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_, res, next) => {
    res.sendFile(join(clientDist, 'index.html'), (err) => err && next());
  });
}

app.listen(PORT, () => {
  console.log(`Bluewave API running at http://localhost:${PORT}`);
});
