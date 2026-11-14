import { Service, Product, Project } from '../models/index.js';
import { env } from '../config/env.js';
import { getMergedSettings } from './settingsController.js';

async function baseUrl(req) {
  const settings = await getMergedSettings();
  return (settings.seo.siteUrl || env.publicSiteUrl || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

const STATIC_PATHS = [
  ['/', '1.0', 'weekly'],
  ['/about', '0.8', 'monthly'],
  ['/services', '0.9', 'monthly'],
  ['/industries', '0.8', 'monthly'],
  ['/products', '0.8', 'weekly'],
  ['/projects', '0.7', 'weekly'],
  ['/contact', '0.8', 'yearly'],
  ['/request-a-quote', '0.9', 'yearly'],
  ['/privacy-policy', '0.3', 'yearly'],
  ['/terms-and-conditions', '0.3', 'yearly'],
];

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

export async function sitemap(req, res) {
  const base = await baseUrl(req);
  const [services, products, projects] = await Promise.all([
    Service.find({ published: true }).select('slug updatedAt').lean(),
    Product.find({ published: true }).select('slug updatedAt').lean(),
    Project.find({ published: true }).select('slug updatedAt').lean(),
  ]);
  const urls = [
    ...STATIC_PATHS.map(([p, priority, changefreq]) => ({ loc: base + p, priority, changefreq })),
    ...services.map((s) => ({ loc: `${base}/services/${s.slug}`, lastmod: s.updatedAt, priority: '0.8', changefreq: 'monthly' })),
    ...products.map((s) => ({ loc: `${base}/products/${s.slug}`, lastmod: s.updatedAt, priority: '0.6', changefreq: 'monthly' })),
    ...projects.map((s) => ({ loc: `${base}/projects/${s.slug}`, lastmod: s.updatedAt, priority: '0.6', changefreq: 'monthly' })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

export async function robots(req, res) {
  const base = await baseUrl(req);
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`);
}
