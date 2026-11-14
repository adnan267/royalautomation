/**
 * File storage for uploaded images and quote attachments.
 *
 *  STORAGE_DRIVER=gridfs (default) — files are stored in MongoDB GridFS.
 *      Works on serverless hosts such as Vercel, where the disk is read-only.
 *  STORAGE_DRIVER=disk — files are written to UPLOAD_DIR (VPS / dedicated server).
 */
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const BUCKETS = ['media', 'attachments'];
const safeName = (name) => path.basename(String(name));

function bucketFor(name) {
  if (!BUCKETS.includes(name)) throw new Error(`Unknown storage bucket: ${name}`);
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: name });
}

function diskDir(bucket) {
  const dir = path.resolve(env.uploadDir, bucket);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const gridfs = {
  async save(bucket, filename, buffer, contentType) {
    await new Promise((resolve, reject) => {
      const up = bucketFor(bucket).openUploadStream(filename, { contentType, metadata: { contentType } });
      Readable.from(buffer).pipe(up).on('error', reject).on('finish', resolve);
    });
  },
  async open(bucket, filename) {
    const [file] = await bucketFor(bucket).find({ filename: safeName(filename) }).limit(1).toArray();
    if (!file) return null;
    return {
      stream: bucketFor(bucket).openDownloadStream(file._id),
      length: file.length,
      contentType: file.contentType || file.metadata?.contentType || 'application/octet-stream',
    };
  },
  async remove(bucket, filename) {
    const files = await bucketFor(bucket).find({ filename: safeName(filename) }).toArray();
    await Promise.all(files.map((f) => bucketFor(bucket).delete(f._id).catch(() => {})));
  },
};

const disk = {
  async save(bucket, filename, buffer) {
    await fs.promises.writeFile(path.join(diskDir(bucket), safeName(filename)), buffer);
  },
  async open(bucket, filename, contentType) {
    const full = path.join(diskDir(bucket), safeName(filename));
    const stat = await fs.promises.stat(full).catch(() => null);
    if (!stat) return null;
    return { stream: fs.createReadStream(full), length: stat.size, contentType: contentType || 'application/octet-stream' };
  },
  async remove(bucket, filename) {
    await fs.promises.unlink(path.join(diskDir(bucket), safeName(filename))).catch(() => {});
  },
};

export const storage = env.storageDriver === 'disk' ? disk : gridfs;
