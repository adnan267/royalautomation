import mongoose from 'mongoose';
import { Quote, Inquiry } from '../models/index.js';
import { QUOTE_STATUSES } from '../models/Quote.js';
import { INQUIRY_STATUSES } from '../models/Inquiry.js';
import { quoteSchema, inquirySchema } from '../validators/schemas.js';
import { ATTACHMENT_TYPES, randomName } from '../middleware/upload.js';
import { storage } from '../storage/index.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { makeReference, escapeRegex } from '../utils/reference.js';
import { getMergedSettings } from './settingsController.js';

function zodFail(result) {
  const fields = {};
  for (const i of result.error.issues) fields[i.path.join('.') || '_'] ??= i.message;
  return new HttpError(422, 'Please check the highlighted fields.', fields);
}

/* --------------------------- Public create --------------------------- */
export async function createQuote(req, res) {
  const files = req.files || [];
  const parsed = quoteSchema.safeParse(req.body || {});
  if (!parsed.success) throw zodFail(parsed);
  const { website, ...data } = parsed.data;
  const attachments = [];
  for (const f of files) {
    const filename = randomName(ATTACHMENT_TYPES.get(f.mimetype) || '.bin');
    // eslint-disable-next-line no-await-in-loop
    await storage.save('attachments', filename, f.buffer, f.mimetype);
    attachments.push({ filename, originalName: f.originalname.slice(0, 200), mimetype: f.mimetype, size: f.size });
  }
  const quote = await Quote.create({
    ...data,
    reference: makeReference('Q'),
    attachments,
    ip: req.ip,
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
  });
  const settings = await getMergedSettings();
  res.status(201).json({ reference: quote.reference, message: settings.website.quoteSuccessMessage });
}

export async function createInquiry(req, res) {
  const { website, ...data } = req.validated;
  const inquiry = await Inquiry.create({ ...data, reference: makeReference('C'), ip: req.ip });
  const settings = await getMergedSettings();
  res.status(201).json({ reference: inquiry.reference, message: settings.website.contactSuccessMessage });
}

/* ------------------------------ Admin -------------------------------- */
function adminHandlers(Model, { label, statuses, searchFields }) {
  async function list(req, res) {
    const query = {};
    if (statuses.includes(req.query.status)) query.status = req.query.status;
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      query.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const [items, total, counts] = await Promise.all([
      Model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(query),
      Promise.all(statuses.map(async (s) => [s, await Model.countDocuments({ status: s })])),
    ]);
    res.json({ items, total, page, limit, counts: Object.fromEntries(counts) });
  }

  async function getOne(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) throw notFound(label);
    const item = await Model.findById(req.params.id).lean();
    if (!item) throw notFound(label);
    res.json(item);
  }

  async function update(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) throw notFound(label);
    const item = await Model.findById(req.params.id);
    if (!item) throw notFound(label);
    const { status, note } = req.validated;
    if (status && status !== item.status) {
      item.notes.push({ text: `Status changed from “${item.status}” to “${status}”.`, by: req.user.name });
      item.status = status;
    }
    if (note) item.notes.push({ text: note, by: req.user.name });
    await item.save();
    res.json(item);
  }

  async function remove(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) throw notFound(label);
    const item = await Model.findById(req.params.id).lean();
    if (!item) throw notFound(label);
    await Model.deleteOne({ _id: item._id });
    await Promise.all((item.attachments || []).map((a) => storage.remove('attachments', a.filename)));
    res.json({ ok: true });
  }

  return { list, getOne, update, remove };
}

export const quoteAdmin = adminHandlers(Quote, {
  label: 'Quote request',
  statuses: QUOTE_STATUSES,
  searchFields: ['fullName', 'email', 'companyName', 'reference', 'phone', 'service'],
});

export const inquiryAdmin = adminHandlers(Inquiry, {
  label: 'Inquiry',
  statuses: INQUIRY_STATUSES,
  searchFields: ['name', 'email', 'company', 'reference', 'subject'],
});

export async function downloadAttachment(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw notFound('Quote request');
  const quote = await Quote.findById(req.params.id).lean();
  const file = quote?.attachments?.find((a) => a.filename === req.params.filename);
  if (!file) throw notFound('Attachment');
  const stored = await storage.open('attachments', file.filename, file.mimetype);
  if (!stored) throw notFound('Attachment file');
  res.set({
    'Content-Type': file.mimetype || stored.contentType,
    'Content-Length': stored.length,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName || file.filename)}`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-store',
  });
  stored.stream.on('error', () => res.destroy()).pipe(res);
}
