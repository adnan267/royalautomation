/**
 * Vercel Function entry point.
 * vercel.json rewrites /api/*, /uploads/*, /sitemap.xml and /robots.txt here and passes
 * the original path in the __route query parameter; the Express app handles the rest.
 */
import { createApp } from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { ensureSeed } from '../backend/src/seed/ensureSeed.js';

const app = createApp();
let ready = null;

function init() {
  if (!ready) {
    ready = connectDB()
      .then(() => ensureSeed({ log: console.log }))
      .catch((err) => {
        ready = null;
        throw err;
      });
  }
  return ready;
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const route = url.searchParams.get('__route');
  if (route) {
    url.searchParams.delete('__route');
    const qs = url.searchParams.toString();
    req.url = `${route.startsWith('/') ? route : `/${route}`}${qs ? `?${qs}` : ''}`;
  }
  try {
    await init();
  } catch (err) {
    console.error('[api] database connection failed:', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Service temporarily unavailable. Please try again shortly.' }));
    return;
  }
  app(req, res);
}
