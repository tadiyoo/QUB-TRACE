# Deploy TRACE Dashboard on Railway (full procedure)

This deploys the **entire app**: Next.js, login, reports, and **SQLite** on a persistent volume.

**Cost:** Railway includes **~$5 free credit per month**; after that usage is billed. Check [railway.app/pricing](https://railway.app/pricing).

---

## Before you start

- A **GitHub** account and your code pushed to a repository.
- If your repo is the **whole “TRACE Tool Project”** folder (with `trace-dashboard` inside), you will set Railway’s **Root Directory** to `trace-dashboard`.
- If the repo **is only** the dashboard (only `package.json` at the root), leave Root Directory **empty** / default.

---

## Step 1 — Push the app to GitHub

1. Create a new repository on GitHub (e.g. `trace-dashboard`).
2. Push your code. Either:
   - Push only the contents of the **`trace-dashboard`** folder as the repo root, **or**
   - Push the whole project and remember the subfolder name (`trace-dashboard`).

---

## Step 2 — Create a Railway project

1. Go to **[railway.app](https://railway.app)** and sign up / log in (use **GitHub**).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Authorize Railway if asked, then select your repository.
5. Railway will create a **service** and start a first deploy.

---

## Step 3 — Point Railway at the Next.js app (if needed)

If `package.json` is **not** at the repo root:

1. Open your **service** (the deployment card).
2. Go to **Settings**.
3. Find **Root Directory** (or **Source** → root path).
4. Set it to: **`trace-dashboard`** (or whatever folder contains `package.json`).
5. Save. Railway will **redeploy** automatically.

---

## Step 4 — Add a persistent volume (SQLite)

Without this, the database can be lost on restart/redeploy.

1. Still on the **same service**, open **Settings**.
2. Find **Volumes** (or **Storage**).
3. Click **Add volume** / **New volume**.
4. **Mount path:** `/data`  
   **Size:** 1 GB is enough for demos.
5. Save. Railway may redeploy when the volume is attached.

*(If your UI shows “Add volume” from the service’s **Variables** or **Resources** tab, use that—the mount path must be `/data`.)*

---

## Step 5 — Set the database path

1. Open the service → **Variables** (or **Environment**).
2. Add a new variable:
   - **Name:** `DATABASE_PATH`  
   - **Value:** `/data/trace-data.sqlite`
3. Save. Trigger a **Redeploy** if it doesn’t start automatically (**Deployments** → **Redeploy**).

The app reads this in `src/lib/db.ts` so SQLite lives on the volume.

---

## Step 6 — Confirm build and start

Railway should use:

- **Build:** `npm install` + `npm run build` (auto-detected for Next.js)
- **Start:** `npm start` → `next start` (uses `PORT` from Railway automatically)

You usually **do not** need to set `PORT` yourself.

If the build fails:

- Open **Deployments** → latest deploy → **Build logs**.
- Common fixes: ensure **Root Directory** is correct; ensure Node version is 18+ (Railway default is fine).

---

## Step 7 — Get a public URL

1. Open the service → **Settings** → **Networking** (or **Generate Domain**).
2. Click **Generate domain** (or add a custom domain later).
3. Copy the URL (e.g. `https://something-production.up.railway.app`).

Share this URL with your class.

---

## Step 8 — First use after deploy

1. Open the URL in a browser (**HTTPS**).
2. **Register** a user account (or log in if you already created one).
3. Create a test report to confirm SQLite and APIs work.

---

## Checklist (quick reference)

| Step | Action |
|------|--------|
| 1 | Code on GitHub |
| 2 | New project → Deploy from GitHub |
| 3 | **Root Directory** = `trace-dashboard` if app is in a subfolder |
| 4 | **Volume** mounted at `/data` |
| 5 | **`DATABASE_PATH`** = `/data/trace-data.sqlite` |
| 6 | Build succeeds, service **Active** |
| 7 | **Public domain** generated |
| 8 | Register user, test the app |

---

## Other hosts

See the bottom of this file for **Fly.io** and **Render** (shorter notes).

---

## Option B: Fly.io (free tier)

1. Install [Fly CLI](https://fly.io/docs/hires/install-flyctl/).
2. In the app folder: `fly launch --no-deploy` (no Postgres).
3. `fly volumes create trace_data --region <region> --size 1`
4. In `fly.toml`, add:

   ```toml
   [mounts]
     source = "trace_data"
     destination = "/data"
   ```

5. `fly secrets set DATABASE_PATH=/data/trace-data.sqlite`
6. `fly deploy` → `fly open`

---

## Option C: Render (free, ephemeral DB)

[render.com](https://render.com) → Web Service from GitHub → root directory `trace-dashboard` if needed. Build `npm install && npm run build`, start `npm start`. **No volume:** SQLite resets when the instance restarts—OK for a one-off demo.

---

## After deployment

- **Railway + volume:** Users, sessions, and reports **persist** across deploys.
- **Register** at least one account on the live site before class if you want a demo login ready.
