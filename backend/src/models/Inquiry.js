import mongoose from 'mongoose';

export const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];

const inquirySchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    company: { type: String, default: '', trim: true, maxlength: 160 },
    subject: { type: String, default: '', trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 6000 },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new', index: true },
    notes: { type: [{ text: String, by: String, at: { type: Date, default: Date.now } }], default: [] },
    ip: { type: String, select: false },
  },
  { timestamps: true },
);

export default mongoose.model('Inquiry', inquirySchema);
