import mongoose from 'mongoose';

export const QUOTE_STATUSES = ['new', 'in_review', 'quoted', 'in_progress', 'completed', 'closed'];

const attachmentSchema = new mongoose.Schema(
  { filename: String, originalName: String, mimetype: String, size: Number },
  { _id: false },
);

const noteSchema = new mongoose.Schema(
  { text: { type: String, maxlength: 4000 }, by: String, at: { type: Date, default: Date.now } },
  { _id: true },
);

const quoteSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    companyName: { type: String, default: '', trim: true, maxlength: 160 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    industry: { type: String, default: '', trim: true, maxlength: 120 },
    service: { type: String, default: '', trim: true, maxlength: 160 },
    equipmentDetails: { type: String, default: '', maxlength: 3000 },
    problemDescription: { type: String, required: true, maxlength: 6000 },
    preferredContact: { type: String, enum: ['email', 'phone', 'whatsapp'], default: 'email' },
    attachments: { type: [attachmentSchema], default: [] },
    status: { type: String, enum: QUOTE_STATUSES, default: 'new', index: true },
    notes: { type: [noteSchema], default: [] },
    source: { type: String, default: 'website' },
    ip: { type: String, select: false },
    userAgent: { type: String, select: false },
  },
  { timestamps: true },
);

export default mongoose.model('Quote', quoteSchema);
