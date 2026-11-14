import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    client: { type: String, default: '', trim: true, maxlength: 120 },
    industry: { type: String, default: '', trim: true, maxlength: 120 },
    location: { type: String, default: '', trim: true, maxlength: 120 },
    completedOn: { type: String, default: '', maxlength: 40 },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    summary: { type: String, default: '', maxlength: 600 },
    challenge: { type: String, default: '', maxlength: 4000 },
    solution: { type: String, default: '', maxlength: 4000 },
    outcome: { type: String, default: '', maxlength: 4000 },
    services: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Project', projectSchema);
