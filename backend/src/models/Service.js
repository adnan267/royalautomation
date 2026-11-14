import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    cardTitle: { type: String, trim: true, maxlength: 140 },
    icon: { type: String, default: 'Settings' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 400 },
    intro: { type: String, default: '', maxlength: 2000 },
    description: { type: [String], default: [] },
    features: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    related: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Service', serviceSchema);
