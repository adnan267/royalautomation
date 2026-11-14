# The Royal Automation — Website & Admin Dashboard

**Leader in Industrial Maintenance** · Al Hail, Muscat, Sultanate of Oman

A multi-page MERN (MongoDB, Express, React, Node.js) website for an industrial automation and equipment repair company. It includes an admin dashboard that manages all of the site's content, quote requests and inquiries.

```
royal-automation/
├── api/index.js     Vercel Function entry (runs the Express API)
├── vercel.json      Vercel build, routing, caching and security headers
├── frontend/        React 19 + Vite + Tailwind CSS 4 + React Router 7 + Framer Motion + Lucide
├── backend/         Node.js + Express 5 + MongoDB/Mongoose 8 REST API
├── shared/          Default website content (seeds the database, offline fallback for the site)
├── docs/            API reference and deployment guide
└── .github/         CI: build + API tests on every push
```

## What's included

**Public website**
Home · About Us · Services · 10 individual service pages · Industries · **Store** (products & spare parts) · Product details · **Gallery** (photos & videos) · Projects / Our Work · Project details · Contact Us · Request a Quote · Privacy Policy · Terms & Conditions · 404.

- Homepage follows the supplied design: top info bar, sticky header with dropdowns, hero, service highlights bar, 6 core services, 6 industries, engineering-expertise split, 4-step process, "Why Choose Us", CTA banner and footer with red accent line.
- Brand system: Primary Blue `#0865A9`, Dark Navy `#062653`, Brand Red `#B5202B`, Light `#F4F7FB`, Dark Text `#172B45`. Barlow Condensed and Barlow fonts are bundled locally, not loaded from Google.
- The original logo is used unaltered. Only its white margins were trimmed; it was not recoloured or distorted. In the footer it sits on a white card so the colours stay true.
- Fully responsive, tested at 320, 360, 390, 414, 768 and 1024 px on every public and admin page: no sideways scrolling, tap targets of at least 24 px, 16 px form text (no iPhone zoom-in), a hamburger menu with accordions, and card layouts for admin lists on phones. Subtle animations respect "reduced motion".
- Forms validate on the client and the server, show clear error messages and focus the first invalid field. They also have a spam honeypot and rate limiting.
- **Store:** catalogue with OMR prices (3 decimals), old/discount price, stock status, categories, search, sorting and an "in stock" filter. Each product has a quantity selector and an **Order on WhatsApp** button that opens a pre-filled order message (product, part number, quantity, price, link). Products without a price show "Price on request". Old `/products` links redirect to `/store`.
- **Gallery:** photos and videos with Photos/Videos tabs, albums and a full-screen lightbox (keyboard, swipe, prev/next). Videos can be YouTube/Vimeo links or uploaded MP4/WebM/MOV files (via Vercel Blob). The latest items also appear on the homepage.
- **Brands slider:** an auto-scrolling, infinite brand strip on the homepage and store page. It pauses on hover and stays still when the visitor has "reduced motion" on. It is seeded with common automation brands (names only); upload the official logos in the admin.
- **No invented facts.** Phone, email, WhatsApp, address, statistics, testimonials and certifications are empty until you enter them in the admin. Empty contact channels are hidden, and visitors are directed to the contact form. Animated statistics appear only after you enter real figures.

**Admin dashboard** (`/admin`)
- Secure login: bcrypt password hashing, JWT in an httpOnly cookie, rate-limited sign-in, protected routes.
- Dashboard: counts of new and total leads, content totals, latest requests, and setup reminders.
- **Quote requests**: list with status tabs and search, a detail drawer, attachment download, status workflow (`new → in review → quoted → in progress → completed → closed`), internal notes, and one-click Email / Call / WhatsApp to the customer.
- **Contact inquiries**: same workflow (`new → read → replied → archived`).
- **Store Products**: prices, old price, unit, stock status, gallery images, specifications.
- **Gallery**: bulk photo upload into albums, YouTube/Vimeo links, direct video upload with progress and an automatic thumbnail, featured/hidden, captions.
- **Brands**: name, logo, website link, order, show/hide.
- **Services, Industries, Products, Projects**: full create/edit/delete, publish/hide, ordering, "show on homepage", images, SEO fields, related services and product specifications.
- **Media library**: drag-and-drop upload (works from a phone too). Images are resized in the browser and on the server to a maximum of 2400px and converted to WebP. Alt text editing, reuse anywhere.
- **Settings & SEO**: company and About-page content, contact details, Google Map, social links, every homepage section, per-page SEO titles and descriptions, Open Graph image, top bar and WhatsApp toggles, form success messages.
- **My Account**: change password.

**SEO & performance**
Clean URLs (`/services/vfd-servo-drive-repair`) · unique title, meta description and canonical tag per page · Open Graph and Twitter cards · live `sitemap.xml` and `robots.txt` generated from the database · schema.org `Organization`/`LocalBusiness`, `Service`, `Product` and `BreadcrumbList` JSON-LD · alt text on every image · semantic HTML and an accessible skip link · route-level code splitting · lazy images · WebP uploads · gzip compression · long-cache static assets.

---

## Deploy to GitHub + Vercel

The repository is ready for **Vercel**. The website and API deploy together as one project, and uploads are stored in MongoDB, so there's no disk to configure. Follow **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. In short:

1. Create a free MongoDB Atlas cluster and allow network access from `0.0.0.0/0`.
2. Push this folder to a GitHub repository.
3. Import the repo in Vercel and add `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
4. Deploy, then open `/admin`. Default content and your admin account are created automatically on first run.
5. Optional, for uploading video files: in Vercel go to **Storage → Create → Blob** and connect it to the project (YouTube links work without this).

## Local development

**Requirements:** Node.js 20 or newer, and MongoDB (local or Atlas).

```bash
npm install                            # installs frontend + backend (npm workspaces)
cp backend/.env.example backend/.env   # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev                            # API on :5000 + website on http://localhost:5173
```

Open **http://localhost:5173** for the website and **http://localhost:5173/admin** for the dashboard. On the first start, the API loads the default content and creates the admin user from `.env`.

### First things to do in the admin

1. **Settings → Contact**: add the real phone, email, WhatsApp number, address and Google Maps embed.
2. **Settings → Social Media**: add your profile URLs.
3. **Settings → SEO**: set your website URL. This is used for canonical links and the sitemap.
4. **Media Library**: upload your own project and workshop photos and assign them to services, industries and products. The **Food & Beverage** industry has no stock photo yet, so add one.
5. **Projects**: add real case studies when you're ready. Until then the page shows a "coming soon" message.

### Commands (run from the project root)

| Command | What it does |
|---|---|
| `npm run dev` | API and website together, with auto-reload |
| `npm run build` | Production build of the website (`frontend/dist`) |
| `npm run start` | Start the API in production mode (VPS) |
| `npm run seed` | Insert default content and the admin user if missing (safe to re-run) |
| `npm run seed:reset -w backend` | Reset services, industries, products and settings to the defaults |
| `npm run create-admin -- --email you@co.com --name "Name" --password "..."` | Create an admin or reset an admin's password |
| `npm run test:api` | API test suite (40 checks) against a running API (`API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) |

---

## Editing tips

- **Red highlight in headings:** wrap words in asterisks, e.g. `Our *Core* Services` → "CORE" appears in brand red.
- **Homepage services:** turn on "Show on homepage" for up to 6 services (Admin → Services → ★ Homepage).
- **Ordering:** lower "Display order" numbers appear first.
- **Images:** use landscape photos at least 1600px wide. The hero image works best with its subject on the right.
- **Photos included:** the default photos are free-licence images from [Pexels](https://www.pexels.com/license/) and [Pixabay](https://pixabay.com/service/license-summary/), loaded from their servers. For best performance and brand authenticity, replace them with your own photos via the Media Library.

## Project structure

```
backend/src/
  config/        env.js (validated config), db.js (Mongo connection)
  models/        User, Settings, Service, Industry, Product, Project, Quote, Inquiry, Media
  storage/       file storage: MongoDB GridFS (default, Vercel-safe) or local disk
  validators/    zod schemas for every write endpoint
  middleware/    auth (JWT cookie), validate, upload (multer), rate limits, error handler
  controllers/   auth, settings, crudFactory, submissions (quotes/inquiries), media, dashboard, seo
  routes/        index.js — all REST routes
  seed/          ensureSeed.js (automatic first-run setup), seed.js, createAdmin.js
frontend/src/
  components/    layout/ (TopBar, Header, Footer, WhatsApp) · home/ (homepage sections) · sections/ (cards, process, CTA) · ui/
  pages/         public pages
  admin/         AdminApp, components/ (layout, drawers, editors, media picker), pages/
  context/       SiteContext (settings + content), AuthContext
  lib/           api client, icons, utils, validation, useFetch
shared/content.js  default content
```

## Security notes

- Passwords are hashed with bcrypt (cost 12). Sessions use a signed JWT in an **httpOnly** cookie and are invalidated when the password changes.
- Every write endpoint is validated server-side with zod. Mongoose `sanitizeFilter` blocks query-operator injection.
- Helmet security headers, CORS restricted to `CLIENT_URL`, and rate limits on login, forms and the API.
- Quote attachments are type-checked (no executables or SVG), size-limited, stored privately in the database, and can only be downloaded by signed-in admins.
- Security headers (CSP, nosniff, frame and referrer policy) are set in `vercel.json`.
- No secrets live in the frontend. `.env` files are git-ignored.

See **[docs/API.md](docs/API.md)** for the REST API and **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for production deployment.
