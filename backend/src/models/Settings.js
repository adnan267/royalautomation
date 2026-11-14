import mongoose from 'mongoose';

/**
 * Single-document collection holding all editable website settings:
 * company info, contact details, social links, homepage content, SEO and
 * general website options. Sub-documents are stored as flexible objects and
 * validated with zod in the controller.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    company: { type: mongoose.Schema.Types.Mixed, default: {} },
    contact: { type: mongoose.Schema.Types.Mixed, default: {} },
    social: { type: mongoose.Schema.Types.Mixed, default: {} },
    home: { type: mongoose.Schema.Types.Mixed, default: {} },
    website: { type: mongoose.Schema.Types.Mixed, default: {} },
    seo: { type: mongoose.Schema.Types.Mixed, default: {} },
    // One-time setup steps already applied to this database (see seed/ensureSeed.js).
    seeds: { type: [String], default: [] },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('Settings', settingsSchema);
