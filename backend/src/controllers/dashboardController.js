import { Quote, Inquiry, Service, Industry, Product, Project, Media } from '../models/index.js';
import { QUOTE_STATUSES } from '../models/Quote.js';

export async function stats(_req, res) {
  const [quoteCounts, newInquiries, totalInquiries, services, industries, products, projects, media, latestQuotes, latestInquiries] =
    await Promise.all([
      Promise.all(QUOTE_STATUSES.map(async (s) => [s, await Quote.countDocuments({ status: s })])),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments({}),
      Service.countDocuments({}),
      Industry.countDocuments({}),
      Product.countDocuments({}),
      Project.countDocuments({}),
      Media.countDocuments({}),
      Quote.find({}).sort({ createdAt: -1 }).limit(5).select('reference fullName companyName service status createdAt').lean(),
      Inquiry.find({}).sort({ createdAt: -1 }).limit(5).select('reference name subject status createdAt').lean(),
    ]);
  const quotes = Object.fromEntries(quoteCounts);
  res.json({
    quotes: { ...quotes, total: Object.values(quotes).reduce((a, b) => a + b, 0) },
    inquiries: { new: newInquiries, total: totalInquiries },
    content: { services, industries, products, projects, media },
    latestQuotes,
    latestInquiries,
  });
}
