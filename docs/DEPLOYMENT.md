# Deployment Guide — GitHub + Vercel

The project deploys to Vercel as **one project**. Vercel serves the React website from its CDN and runs the Express API as a Vercel Function, both on the same domain. Uploaded images and quote attachments are stored in MongoDB (GridFS), so nothing is written to Vercel's read-only disk.

```
Browser ──► Vercel CDN ── /assets, /brand, pages ──► frontend/dist (static)
                      └── /api/*, /uploads/*, /sitemap.xml, /robots.txt ──► api/index.js (Express) ──► MongoDB Atlas
```

You need three free accounts: **GitHub**, **Vercel** and **MongoDB Atlas**.

---

## Step 1 — Create the database (MongoDB Atlas)

1. Sign in at https://cloud.mongodb.com and create a free **M0** cluster. A region close to your Vercel region works best; Vercel's default is Washington, D.C. (`iad1`).
2. **Database Access** → *Add New Database User*. Choose a username and a strong password, with the role *Read and write to any database*.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere (`0.0.0.0/0`)**. Vercel Functions don't have fixed IP addresses.
4. **Connect** → *Drivers* → copy the connection string and add a database name before the `?`:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/royal_automation?retryWrites=true&w=majority
   ```
   If your password contains special characters such as `@`, `#` or `/`, URL-encode them.

## Step 2 — Push the code to GitHub

1. Create a new **private** repository on GitHub (for example `royal-automation`) without a README.
2. In the project folder (the one containing `vercel.json`):
   ```bash
   git init
   git add .
   git commit -m "The Royal Automation website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/royal-automation.git
   git push -u origin main
   ```
   `.gitignore` already excludes `node_modules`, `.env` files, build output and uploads, so no secrets are pushed.
3. GitHub Actions (`.github/workflows/ci.yml`) then builds the site and runs the API test suite against a temporary MongoDB on every push. Check the **Actions** tab.

## Step 3 — Import the project into Vercel

1. Go to https://vercel.com/new → **Import Git Repository** → select the repo.
2. Keep **Root Directory** as `./` (the repository root). `vercel.json` already sets the install command, build command, output directory (`frontend/dist`), function and routing.
3. Open **Environment Variables** and add:

   | Name | Value | Required |
   |---|---|---|
   | `MONGODB_URI` | the Atlas connection string from Step 1 | ✅ |
   | `JWT_SECRET` | a long random string, generated with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` | ✅ |
   | `ADMIN_EMAIL` | your admin login email | ✅ first deploy |
   | `ADMIN_PASSWORD` | 10+ characters | ✅ first deploy |
   | `ADMIN_NAME` | your name | optional |
   | `PUBLIC_SITE_URL` | `https://www.yourdomain.com` (once you have a domain) | optional |

4. Click **Deploy**. On the first request the API automatically:
   - loads the default website content (services, industries, products, settings);
   - creates your admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
5. Open `https://<your-project>.vercel.app` for the website and `https://<your-project>.vercel.app/admin` for the admin.
6. After you've signed in, you can delete `ADMIN_PASSWORD` from Vercel. The account stays in the database; change its password in **Admin → My Account**.

Every later `git push` to `main` redeploys automatically. Pull requests get their own preview URLs.

## Step 4 — Custom domain

Vercel → Project → **Settings → Domains** → add `yourdomain.com` and `www.yourdomain.com`, then create the DNS records Vercel shows at your domain registrar. HTTPS is issued automatically.

Then:
- **Admin → Settings → SEO → Website URL**: `https://www.yourdomain.com`. This is used for canonical tags and the sitemap.
- Submit `https://www.yourdomain.com/sitemap.xml` in Google Search Console.

---

## Limits to know on Vercel

| Item | Value | Notes |
|---|---|---|
| Request size | 4.5 MB (Vercel limit) | Quote-form attachments are limited to **4 MB in total** on Vercel. The form shows this and blocks larger files before upload |
| Admin image uploads | Any size | Photos are resized in the browser (max 2400 px) and then optimised to WebP on the server, one image per request |
| Storage | MongoDB GridFS | Atlas M0 has 512 MB. Optimised photos are usually 150–400 KB each, so a few hundred photos fit comfortably. Upgrade Atlas if needed |
| Function timeout | 30 s (`vercel.json`) | Plenty for this API |
| Rate limiting | Per function instance | Basic protection. For stronger protection enable Vercel Firewall rules on `/api/quotes`, `/api/inquiries` and `/api/auth/login` |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Site loads but shows default content and forms say *"Could not reach the server"* / API returns 503 | Check that `MONGODB_URI` is correct and that Atlas **Network Access** allows `0.0.0.0/0`. See Vercel → Project → **Logs** |
| Can't sign in to `/admin` | Check `ADMIN_EMAIL`/`ADMIN_PASSWORD` were set **before** the first request. Otherwise run `npm run create-admin -- --email you@co.com --password "NewPassword123"` locally with `MONGODB_URI` pointing to Atlas |
| `JWT_SECRET must be at least 32 characters` in logs | Use a longer secret |
| Changed environment variables but nothing changed | Vercel → Deployments → ⋯ → **Redeploy** (env changes apply to new deployments) |
| Upload fails with 413 | The file is over the limit. Compress it or send it by email/WhatsApp |

## Running locally

```bash
npm install                          # installs frontend + backend (npm workspaces)
cp backend/.env.example backend/.env # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev                          # API :5000 + website :5173 (with /api proxy)
```

To try the production setup locally with the Vercel CLI: `npm i -g vercel`, then `vercel link`, `vercel env pull backend/.env`, `vercel dev`.

---

## Alternative: VPS / single Node server

If you'd rather host on your own server (Ubuntu + Nginx + PM2):

```bash
npm ci && npm run build
cp backend/.env.example backend/.env   # set NODE_ENV=production, MONGODB_URI, JWT_SECRET, SERVE_CLIENT=true,
                                       # TRUST_PROXY=1, CLIENT_URL/PUBLIC_SITE_URL=https://www.yourdomain.com
npm i -g pm2 && pm2 start backend/src/server.js --name royal-automation --cwd backend && pm2 save
```

Then point Nginx at `127.0.0.1:5000` (`client_max_body_size 30m;`) and add HTTPS with `certbot --nginx`. On a VPS you can set `STORAGE_DRIVER=disk` to keep uploads in `backend/uploads` instead of MongoDB. If you do, back that folder up.
