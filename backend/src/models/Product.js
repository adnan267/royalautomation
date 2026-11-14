import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: 'General', trim: true, maxlength: 80 },
    brand: { type: String, default: '', trim: true, maxlength: 80 },
    partNumber: { type: String, default: '', trim: true, maxlength: 80 },
    image: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    imageAlt: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 400 },
    description: { type: String, default: '', maxlength: 6000 },
    features: { type: [String], default: [] },
    applications: { type: [String], default: [] },
    specifications: { type: [{ label: String, value: String }], default: [] },
    availability: { type: String, default: 'Enquire for availability', maxlength: 80 },
    // Store fields (prices in the store currency, e.g. OMR). No price = "Price on request".
    price: { type: Number, min: 0 },
    oldPrice: { type: Number, min: 0 },
    unit: { type: String, default: '', maxlength: 30 },
    stockStatus: { type: String, enum: ['', 'in_stock', 'limited', 'on_order', 'out_of_stock'], default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Product', productSchema);
