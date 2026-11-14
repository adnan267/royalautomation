import mongoose from 'mongoose';

/** A gallery photo or video. Videos are YouTube/Vimeo links or uploaded files (Vercel Blob URL). */
const galleryItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true, index: true },
    title: { type: String, default: '', trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    caption: { type: String, default: '', maxlength: 600 },
    album: { type: String, default: '', trim: true, maxlength: 80 },
    image: { type: String, default: '' }, // photo, or video thumbnail / poster
    videoUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('GalleryItem', galleryItemSchema);
