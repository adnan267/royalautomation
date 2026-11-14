import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { sitemap, robots } from './controllers/seoController.js';
import { serveMedia } from './controllers/mediaController.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.trustProxy !== 'false') app.set('trust proxy', Number.isNaN(Number(env.trustProxy)) ? env.trustProxy : Number(env.trustProxy));

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow the React app to load /uploads images
      contentSecurityPolicy: env.serveClient
        ? {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              fontSrc: ["'self'", 'data:'],
              frameSrc: ['https://www.google.com', 'https://maps.google.com'],
              connectSrc: ["'self'"],
              objectSrc: ["'none'"],
            },
          }
        : false,
    }),
  );
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Public, optimised media uploads. Quote attachments are never public (admin-only API).
  app.get('/uploads/media/:filename', serveMedia);

  app.get('/sitemap.xml', sitemap);
  app.get('/robots.txt', robots);

  app.use('/api', apiLimiter, apiRoutes);
  app.use('/api', notFoundHandler);

  // Optionally serve the built React app from the same server (single-domain deployment).
  if (env.serveClient) {
    const dist = path.resolve(env.clientDist);
    if (fs.existsSync(path.join(dist, 'index.html'))) {
      app.use(express.static(dist, { index: false, maxAge: '1h', setHeaders: (res, p) => {
        if (p.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } }));
      app.get(/^(?!\/(api|uploads)\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
    } else {
      console.warn(`[app] SERVE_CLIENT=true but no build found at ${dist}. Run "npm run build" in /frontend.`);
    }
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
