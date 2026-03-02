# Deploy Bluewave Stock to the web (free)

This guide gets your app online with a **free public URL** and **auto-deploy on every git push**.

We use **[Render.com](https://render.com)** (free tier): no credit card for the free plan, and you get a URL like `https://bluewave-stock.onrender.com`.

---

## 1. Push your code to GitHub

If the project is not in Git yet:

```bash
cd /home/lakshminarasimha/Projects/shop
git init
git add .
git commit -m "Initial commit: Bluewave Stock app"
```

Create a new repository on [GitHub](https://github.com/new) (e.g. `bluewave-stock`). Then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bluewave-stock.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 2. Deploy on Render

1. Go to **[render.com](https://render.com)** and sign up (use “Sign up with GitHub”).
2. Click **Dashboard** → **New +** → **Web Service**.
3. **Connect your GitHub account** if asked, then select the repo (e.g. `bluewave-stock`).
4. Render will read `render.yaml` from the repo. Confirm:
   - **Name:** `bluewave-stock` (or any name you like)
   - **Region:** e.g. Oregon (or nearest to you)
   - **Branch:** `main`
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free
5. Click **Create Web Service**.

Render will install dependencies, build the React app, and start the Node server. The first deploy can take a few minutes.

---

## 3. Your live URL (sample domain)

When the deploy finishes, Render gives you a URL like:

- **https://bluewave-stock.onrender.com**

(or whatever service name you chose). Anyone can open this link and use the app.

---

## 4. Auto-update to production

- Every time you **push to the `main` branch** (e.g. `git push origin main`), Render will:
  - Run the build again
  - Restart the app with the new code
- So: **push changes → production updates automatically.**

You can see deploy history and logs under your service → **Logs** / **Events** on the Render dashboard.

---

## 5. Optional: custom domain

- In Render: open your **Web Service** → **Settings** → **Custom Domains**.
- Add your own domain (e.g. `stock.bluewavebar.com`) and follow the DNS instructions Render shows.
- The free sample domain (e.g. `bluewave-stock.onrender.com`) keeps working.

---

## 6. Data persistence (important on free tier)

- On Render’s **free tier**, the filesystem is **ephemeral**: the SQLite file in `server/data/` is **lost on every deploy or restart**.
- So the app will run and auto-update, but **data will reset** when the service restarts or you push a new version.
- For **permanent data** you can later:
  - Add a [Render Persistent Disk](https://render.com/docs/disks) (paid), or
  - Switch the app to a free hosted database (e.g. PostgreSQL on [Neon](https://neon.tech) or [Supabase](https://supabase.com)).

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Push project to GitHub |
| 2 | Render.com → New Web Service → connect repo |
| 3 | Build: `npm run install:all && npm run build`, Start: `npm run start` |
| 4 | Use the free URL (e.g. `https://bluewave-stock.onrender.com`) |
| 5 | Later: push to `main` → production updates automatically |

If something fails, check **Logs** in the Render dashboard for the exact error message.
