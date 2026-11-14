/**
 * Build-time sitemap.xml + robots.txt for static hosting (Vercel/Netlify).
 * Uses the default content in /shared/content.js. When the backend serves the
 * site, it also exposes a live /sitemap.xml generated from the database.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { services, products } from '../../shared/content.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(dir, '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const base = (process.env.VITE_SITE_URL || 'https://www.example.com').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const paths = [
  ['/', '1.0'], ['/about', '0.8'], ['/services', '0.9'], ['/industries', '0.8'], ['/products', '0.8'],
  ['/projects', '0.7'], ['/contact', '0.8'], ['/request-a-quote', '0.9'], ['/privacy-policy', '0.3'], ['/terms-and-conditions', '0.3'],
  ...services.map((s) => [`/services/${s.slug}`, '0.8']),
  ...products.map((p) => [`/products/${p.slug}`, '0.6']),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(([p, pr]) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
const pub = path.join(dir, '..', 'public');
fs.writeFileSync(path.join(pub, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(pub, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
console.log(`[sitemap] ${paths.length} URLs written for ${base}`);
