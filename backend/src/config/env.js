import 'dotenv/config';

const required = (key, fallback) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === '') throw new Error(`Missing required environment variable: ${key}`);
  return v;
};

const isProd = process.env.NODE_ENV === 'production';
// Vercel sets VERCEL=1. Its functions accept request bodies up to 4.5 MB and have a read-only disk.
const onVercel = Boolean(process.env.VERCEL);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  port: Number(process.env.PORT || 5000),
  mongoUri: required('MONGODB_URI', isProd ? undefined : 'mongodb://127.0.0.1:27017/royal_automation'),
  jwtSecret: required('JWT_SECRET', isProd ? undefined : 'dev-only-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Comma-separated list of allowed browser origins (the React app URL[s]).
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  publicSiteUrl: (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, ''),
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  onVercel,
  storageDriver: process.env.STORAGE_DRIVER || 'gridfs', // 'gridfs' (default, Vercel-safe) or 'disk'
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || (onVercel ? 4 : 10)),
  maxTotalMb: Number(process.env.MAX_TOTAL_UPLOAD_MB || (onVercel ? 4 : 25)),
  maxFiles: Number(process.env.MAX_FILES || 5),
  serveClient: process.env.SERVE_CLIENT === 'true',
  clientDist: process.env.CLIENT_DIST || '../frontend/dist',
  trustProxy: process.env.TRUST_PROXY || (isProd ? '1' : 'false'),
};

if (isProd && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}
