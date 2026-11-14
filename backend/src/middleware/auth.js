import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { HttpError } from '../utils/httpError.js';

export const COOKIE_NAME = 'ra_admin';

export const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.cookieSameSite,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[COOKIE_NAME];
}

/** Attaches req.user if a valid session exists (does not reject). */
export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (user && !(user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime() - 1000)) {
      req.user = user;
    }
  } catch {
    /* invalid token -> anonymous */
  }
  return next();
}

/** Requires an authenticated admin/editor. */
export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {});
  if (!req.user) return next(new HttpError(401, 'Please sign in to continue.'));
  return next();
}

export const requireRole =
  (...roles) =>
  (req, _res, next) =>
    req.user && roles.includes(req.user.role) ? next() : next(new HttpError(403, 'You do not have permission to do this.'));
