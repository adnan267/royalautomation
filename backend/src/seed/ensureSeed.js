import { Settings, Service, Industry, Product, User, Brand } from '../models/index.js';
import { defaultSettings, services, industries, products, brands } from '../../../shared/content.js';

const ignoreDuplicates = (err) => {
  if (err?.code === 11000 || err?.writeErrors?.every?.((e) => e.code === 11000)) return;
  throw err;
};

/**
 * One-time setup steps. Each runs once per database and is then recorded in
 * settings.seeds, so content you edit or delete later is never re-created.
 */
const STEPS = [
  {
    id: 'brands-v1',
    async run() {
      if ((await Brand.countDocuments()) === 0) await Brand.insertMany(brands, { ordered: false }).catch(ignoreDuplicates);
    },
  },
  {
    // Databases created before the slogan/address were provided: update only values never edited.
    id: 'oman-details-v1',
    async run(doc) {
      const set = {};
      if (doc.company?.tagline === 'Leaders in Industrial Maintenance') set['company.tagline'] = defaultSettings.company.tagline;
      if (!doc.contact?.address) set['contact.address'] = defaultSettings.contact.address;
      if (!doc.contact?.mapEmbedUrl) set['contact.mapEmbedUrl'] = defaultSettings.contact.mapEmbedUrl;
      if (!doc.contact?.mapLink) set['contact.mapLink'] = defaultSettings.contact.mapLink;
      if (doc.seo?.defaultDescription?.startsWith('Industrial automation services, PLC programming')) {
        set['seo.defaultDescription'] = defaultSettings.seo.defaultDescription;
      }
      if (doc.seo?.pages?.products?.title === 'Products & Spare Parts') set['seo.pages.products'] = defaultSettings.seo.pages.products;
      if (Object.keys(set).length) await Settings.updateOne({ _id: doc._id }, { $set: set });
    },
  },
];

/**
 * First-run setup, safe to call on every cold start:
 *  - on a brand-new database, inserts the default settings, services, industries and products;
 *  - applies any pending one-time STEPS (e.g. default brands);
 *  - if no admin user exists and ADMIN_EMAIL / ADMIN_PASSWORD are set, creates the admin.
 */
export async function ensureSeed({ log = () => {} } = {}) {
  let doc = await Settings.findOne({ key: 'site' }).lean();
  if (!doc) {
    await Settings.create({ key: 'site', ...defaultSettings }).catch(ignoreDuplicates);
    if ((await Service.countDocuments()) === 0) await Service.insertMany(services, { ordered: false }).catch(ignoreDuplicates);
    if ((await Industry.countDocuments()) === 0) await Industry.insertMany(industries, { ordered: false }).catch(ignoreDuplicates);
    if ((await Product.countDocuments()) === 0) await Product.insertMany(products, { ordered: false }).catch(ignoreDuplicates);
    log('[seed] default website content created');
    doc = await Settings.findOne({ key: 'site' }).lean();
  }

  const done = new Set(doc?.seeds || []);
  for (const step of STEPS) {
    if (done.has(step.id)) continue;
    // eslint-disable-next-line no-await-in-loop
    await step.run(doc);
    // eslint-disable-next-line no-await-in-loop
    await Settings.updateOne({ _id: doc._id }, { $addToSet: { seeds: step.id } });
    log(`[seed] applied ${step.id}`);
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 10 && (await User.countDocuments()) === 0) {
    await User.create({ name: ADMIN_NAME || 'Administrator', email: ADMIN_EMAIL.toLowerCase().trim(), password: ADMIN_PASSWORD, role: 'admin' }).catch(ignoreDuplicates);
    log(`[seed] admin user ${ADMIN_EMAIL} created`);
  }
}
