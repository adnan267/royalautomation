import sharp from 'sharp';
import mongoose from 'mongoose';
import { Media } from '../models/index.js';
import { IMAGE_TYPES, randomName } from '../middleware/upload.js';
import { storage } from '../storage/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { escapeRegex } from '../utils/reference.js';

const RASTER = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Resize large photos and convert to WebP for fast page loads, then store them. */
async function optimiseAndStore(file) {
  if (!RASTER.has(file.mimetype)) {
    const filename = randomName(IMAGE_TYPES.get(file.mimetype) || '.bin');
    await storage.save('media', filename, file.buffer, file.mimetype);
    return { filename, size: file.size, mimetype: file.mimetype };
  }
  let out;
  try {
    out = await sharp(file.buffer)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(422, `Could not process image “${file.originalname}”. Is it a valid image file?`);
  }
  const filename = randomName('.webp');
  await storage.save('media', filename, out.data, 'image/webp');
  return { filename, size: out.info.size, mimetype: 'image/webp', width: out.info.width, height: out.info.height };
}

/** GET /uploads/media/:filename — public, cacheable (filenames are unique and never change). */
export async function serveMedia(req, res) {
  const doc = await Media.findOne({ filename: String(req.params.filename) }).lean();
  const stored = doc && (await storage.open('media', doc.filename, doc.mimetype));
  if (!stored) throw notFound('Image');
  const isSvg = doc.mimetype === 'image/svg+xml';
  res.set({
    'Content-Type': doc.mimetype || stored.contentType,
    'Content-Length': stored.length,
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    ...(isSvg ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
  });
  stored.stream.on('error', () => res.destroy()).pipe(res);
}

export async function listMedia(req, res) {
  const query = {};
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    query.$or = [{ originalName: rx }, { alt: rx }];
  }
  const limit = Math.min(Number(req.query.limit) || 60, 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const [items, total] = await Promise.all([
    Media.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Media.countDocuments(query),
  ]);
  res.json({ items, total, page, limit });
}

export async function uploadMedia(req, res) {
  const files = req.files || [];
  if (!files.length) throw new HttpError(400, 'Choose at least one image to upload.');
  const created = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const out = await optimiseAndStore(file);
    // eslint-disable-next-line no-await-in-loop
    const doc = await Media.create({
      ...out,
      url: `/uploads/media/${out.filename}`,
      originalName: file.originalname.slice(0, 200),
      alt: (req.body?.alt || '').slice(0, 300),
    });
    created.push(doc);
  }
  res.status(201).json({ items: created });
}

export async function updateMedia(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Image');
  const alt = String(req.body?.alt ?? '').trim().slice(0, 300);
  const doc = await Media.findByIdAndUpdate(req.params.id, { alt }, { new: true });
  if (!doc) throw notFound('Image');
  res.json(doc);
}

export async function deleteMedia(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Image');
  const doc = await Media.findById(req.params.id).lean();
  if (!doc) throw notFound('Image');
  await Media.deleteOne({ _id: doc._id });
  await storage.remove('media', doc.filename);
  res.json({ ok: true });
}
