import crypto from 'node:crypto';

/** Human-friendly reference like RA-Q-261114-7F3K */
export function makeReference(prefix) {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = crypto.randomBytes(3).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 4);
  return `RA-${prefix}-${ymd}-${rand}`;
}

export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
