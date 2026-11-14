import { uniqueSlug } from '../utils/slug.js';
import { escapeRegex } from '../utils/reference.js';
import { notFound } from '../utils/httpError.js';
import mongoose from 'mongoose';

/**
 * Generic CRUD controller for slug-based content collections
 * (services, industries, products, projects).
 */
export function crudFactory(Model, { label, titleField = 'title', searchFields = [titleField], filters = [], slugFrom, onDelete }) {
  const slugSource = (data) => data.slug || (slugFrom ? slugFrom(data) : data[titleField]);
  const isAdminView = (req) => Boolean(req.user) && req.query.all === '1';

  async function list(req, res) {
    const query = {};
    if (!isAdminView(req)) query.published = true;
    if (req.query.featured === 'true') query.featured = true;
    for (const f of filters) if (typeof req.query[f] === 'string' && req.query[f]) query[f] = req.query[f];
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      query.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const [items, total] = await Promise.all([
      Model.find(query).sort({ order: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(query),
    ]);
    res.set('Cache-Control', 'no-store'); // admin edits must show immediately
    res.json({ items, total, page, limit });
  }

  async function getOne(req, res) {
    const { idOrSlug } = req.params;
    const byId = mongoose.isValidObjectId(idOrSlug);
    const query = byId ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase() };
    if (!req.user) query.published = true;
    const item = await Model.findOne(query).lean();
    if (!item) throw notFound(label);
    res.json(item);
  }

  async function create(req, res) {
    const data = { ...req.validated };
    data.slug = await uniqueSlug(Model, slugSource(data));
    const item = await Model.create(data);
    res.status(201).json(item);
  }

  async function update(req, res) {
    const item = await Model.findById(req.params.id);
    if (!item) throw notFound(label);
    const data = { ...req.validated };
    data.slug = data.slug ? await uniqueSlug(Model, data.slug, item._id) : item.slug;
    item.set(data);
    await item.save();
    res.json(item);
  }

  async function remove(req, res) {
    const item = await Model.findById(req.params.id).lean();
    if (!item) throw notFound(label);
    await Model.deleteOne({ _id: item._id });
    if (onDelete) await onDelete(item).catch((err) => console.warn(`[${label}] cleanup failed:`, err.message));
    res.json({ ok: true });
  }

  /** Creates many items at once (used for adding several gallery photos). */
  async function createMany(req, res) {
    const created = [];
    for (const data of req.validated.items) {
      // eslint-disable-next-line no-await-in-loop
      created.push(await Model.create({ ...data, slug: await uniqueSlug(Model, slugSource(data)) }));
    }
    res.status(201).json({ items: created });
  }

  return { list, getOne, create, update, remove, createMany };
}
