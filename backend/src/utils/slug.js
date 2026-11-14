import slugify from 'slugify';
import mongoose from 'mongoose';

export const toSlug = (text = '') => slugify(String(text), { lower: true, strict: true, trim: true }).slice(0, 120);

// mongoose.trusted() is needed because sanitizeFilter is enabled globally.
/** Returns a slug that is unique within the given model (ignores `excludeId`). */
export async function uniqueSlug(Model, base, excludeId) {
  const root = toSlug(base) || 'item';
  let slug = root;
  let i = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists(excludeId ? { slug, _id: mongoose.trusted({ $ne: excludeId }) } : { slug })) {
    slug = `${root}-${i++}`;
  }
  return slug;
}
