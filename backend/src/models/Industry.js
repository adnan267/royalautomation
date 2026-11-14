import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: 'Factory' },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 400 },
    description: { type: String, default: '', maxlength: 4000 },
    applications: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Industry', industrySchema);
