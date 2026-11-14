# REST API Reference

Base URL: `/api` (for example `http://localhost:5000/api`). Requests and responses use JSON, except the file-upload endpoints, which use `multipart/form-data`.

**Authentication:** `POST /api/auth/login` sets an httpOnly cookie named `ra_admin`. Browser requests must send credentials (`fetch(..., { credentials: 'include' })`). An `Authorization: Bearer <token>` header is also accepted. 🔒 marks endpoints that require a signed-in admin.

**Errors** have this shape:

```json
{ "message": "Please check the highlighted fields.", "errors": { "email": "Please enter a valid email address" } }
```

| Status | Meaning |
|---|---|
| 400 | Malformed request |
| 401 | Not signed in |
| 404 | Not found |
| 409 | Duplicate value |
| 413 | File too large |
| 415 | File type not allowed |
| 422 | Validation failed (see `errors`) |
| 429 | Rate limited |

## Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | `{ ok: true, time }` |

## Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | Sets the cookie and returns `{ user }`. Limited to 10 failed attempts per 15 minutes |
| POST | `/auth/logout` | – | Clears the cookie |
| GET 🔒 | `/auth/me` | – | `{ user: { id, name, email, role } }` |
| PUT 🔒 | `/auth/password` | `{ currentPassword, newPassword }` | New password needs 10+ characters, including a letter and a number |

## Settings
| Method | Path | Notes |
|---|---|---|
| GET | `/settings` | Public website settings: `company`, `contact`, `social`, `home`, `website`, `seo` |
| PUT 🔒 | `/settings` | Send one or more sections, e.g. `{ "contact": { "phone": "+92 300 1234567" } }`. Objects are deep-merged and arrays are replaced |

## Content collections
The same endpoints exist for **`services`**, **`industries`**, **`products`** and **`projects`**.

| Method | Path | Notes |
|---|---|---|
| GET | `/{collection}` | Published items, sorted by `order`. Query: `featured=true`, `q=search`, `category=` (products), `industry=` (projects), `page`, `limit`. Admins can add `all=1` to include hidden items |
| GET | `/{collection}/:idOrSlug` | A single published item (admins also see hidden items) |
| POST 🔒 | `/{collection}` | Create. `slug` is generated from the title if omitted and kept unique |
| PUT 🔒 | `/{collection}/:id` | Replace the item's fields |
| DELETE 🔒 | `/{collection}/:id` | Delete |

Main fields:
- **Service:** `title, cardTitle, slug, icon, image, imageAlt, excerpt, intro, description[], features[], benefits[], related[] (slugs), featured, published, order, seoTitle, seoDescription`
- **Industry:** `title, slug, icon, image, imageAlt, excerpt, description, applications[], published, order`
- **Product:** `name, slug, category, brand, partNumber, image, gallery[], imageAlt, excerpt, description, features[], applications[], specifications[{label,value}], availability, featured, published, order, seoTitle, seoDescription`
- **Project:** `title, slug, client, industry, location, completedOn, image, gallery[], summary, challenge, solution, outcome, services[], featured, published, order`

## Quote requests
| Method | Path | Notes |
|---|---|---|
| POST | `/quotes` | **multipart/form-data**. Fields: `fullName*`, `companyName`, `email*`, `phone*`, `industry`, `service`, `equipmentDetails`, `problemDescription*`, `preferredContact` (`email`, `phone` or `whatsapp`), `attachments` (up to 5 files; 4 MB in total on Vercel, 10 MB per file / 25 MB total elsewhere; PDF, images, Word, Excel, TXT, CSV, ZIP). Returns `{ reference, message }`. Limited to 20 per hour per IP |
| GET 🔒 | `/quotes` | Query: `status`, `q`, `page`, `limit`. Returns `{ items, total, counts: { new, in_review, ... } }` |
| GET 🔒 | `/quotes/:id` | Full request, including notes |
| PATCH 🔒 | `/quotes/:id` | `{ status?, note? }`. Status: `new`, `in_review`, `quoted`, `in_progress`, `completed`, `closed`. Status changes are logged as notes |
| DELETE 🔒 | `/quotes/:id` | Deletes the request and its attachment files |
| GET 🔒 | `/quotes/:id/attachments/:filename` | Downloads an attachment with its original file name |

## Contact inquiries
| Method | Path | Notes |
|---|---|---|
| POST | `/inquiries` | JSON `{ name*, email*, phone, company, subject, message* }`. Returns `{ reference, message }` |
| GET 🔒 | `/inquiries` | Query: `status` (`new`, `read`, `replied`, `archived`), `q`, `page`, `limit` |
| GET / PATCH / DELETE 🔒 | `/inquiries/:id` | Same behaviour as quotes |

## Media library
| Method | Path | Notes |
|---|---|---|
| GET 🔒 | `/media` | Query: `q`, `page`, `limit` |
| POST 🔒 | `/media` | multipart with `files` (up to 10 images) and optional `alt`. JPG/PNG/WEBP are resized (max 2400px) and converted to WebP. Returns `{ items: [{ url: "/uploads/media/....webp", ... }] }` |
| PATCH 🔒 | `/media/:id` | `{ alt }` |
| DELETE 🔒 | `/media/:id` | Deletes the record and the file |

Uploaded images are served publicly, and cached for a long time, from `/uploads/media/<file>` (outside `/api`). Files are stored in MongoDB GridFS by default (`STORAGE_DRIVER=gridfs`).

## Dashboard
| Method | Path | Notes |
|---|---|---|
| GET 🔒 | `/dashboard/stats` | Quote counts by status, inquiry counts, content counts, latest 5 quotes and inquiries |

## SEO (outside `/api`)
| Method | Path | Notes |
|---|---|---|
| GET | `/sitemap.xml` | Built live from published services, products and projects. Uses Settings → SEO → Website URL, then `PUBLIC_SITE_URL` |
| GET | `/robots.txt` | Allows everything except `/admin` and `/api/`, and links to the sitemap |
