# Bluewave Bar & Kitchen — Stock & Sales

A simple web app for managing alcohol bottle stock, daily sales, and returns.

## Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express
- **Database:** SQLite (file: `server/data/bluewave.db`)

## Setup

```bash
# Install dependencies (root + server + client)
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

## Run locally

**Terminal 1 — API (port 3001):**
```bash
npm run server
```

**Terminal 2 — Frontend (port 5173):**
```bash
npm run client
```

Open [http://localhost:5173](http://localhost:5173). The app proxies `/api` to the backend.

## Build for production (single server)

```bash
npm run build
npm run start
```

The server serves the API and the built React app from `client/dist` on the same port when `client/dist` exists.

## Hosting (free + auto-deploy)

Deploy to the cloud with a **free public URL** and **auto-updates on every push**. See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions using **Render.com**:

1. Push the repo to GitHub  
2. Connect the repo to Render (New Web Service)  
3. Get a URL like `https://bluewave-stock.onrender.com`  
4. Every push to `main` triggers a new deploy  

The repo includes `render.yaml` so Render can use the correct build and start commands. On Render’s free tier, the SQLite database is ephemeral (data resets on deploy/restart); see DEPLOY.md for persistence options.

## Features

- **Brands:** Add/edit/delete alcohol brands (name, category).
- **Stock:** View and adjust bottle count per brand (add/remove or set exact).
- **Daily Sales:** Record bottles sold per brand per day; view and edit by date.
- **Returns:** Record bottles returned per brand per day.
- **Dashboard:** Summary for a selected date (bottles sold, returns, total stock) and last 14 days sales.
