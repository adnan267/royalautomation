import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const IMAGE_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['image/svg+xml', '.svg'],
]);

export const ATTACHMENT_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['application/pdf', '.pdf'],
  ['application/msword', '.doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.ms-excel', '.xls'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx'],
  ['text/plain', '.txt'],
  ['text/csv', '.csv'],
  ['application/zip', '.zip'],
  ['application/x-zip-compressed', '.zip'],
]);

export const randomName = (ext) => `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

const filter = (types, label) => (_req, file, cb) =>
  types.has(file.mimetype) ? cb(null, true) : cb(new HttpError(415, `Unsupported file type. Allowed: ${label}.`));

const limits = (files) => ({ fileSize: env.maxUploadMb * 1024 * 1024, files, fields: 40 });

// Files are kept in memory, then optimised / written to storage (GridFS or disk).
export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filter(IMAGE_TYPES, 'JPG, PNG, WEBP, GIF, SVG'),
  limits: limits(10),
});

export const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filter(ATTACHMENT_TYPES, 'PDF, images, Word, Excel, TXT, CSV, ZIP'),
  limits: limits(env.maxFiles),
});

/** Converts multer errors into friendly HTTP errors and enforces the total upload size. */
export const handleUploadErrors = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (!err) {
      const total = (req.files || []).reduce((s, f) => s + f.size, 0);
      if (total > env.maxTotalMb * 1024 * 1024) {
        return next(new HttpError(413, `Attachments must be ${env.maxTotalMb} MB or less in total.`));
      }
      return next();
    }
    if (err instanceof multer.MulterError) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Each file must be smaller than ${env.maxUploadMb} MB.`
          : err.code === 'LIMIT_FILE_COUNT'
            ? `You can attach up to ${env.maxFiles} files.`
            : err.message;
      return next(new HttpError(413, msg));
    }
    return next(err);
  });
