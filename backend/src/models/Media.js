import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimetype: { type: String, default: '' },
    size: { type: Number, default: 0 },
    width: Number,
    height: Number,
    alt: { type: String, default: '', maxlength: 300 },
    folder: { type: String, default: 'general', maxlength: 60 },
  },
  { timestamps: true },
);

export default mongoose.model('Media', mediaSchema);
