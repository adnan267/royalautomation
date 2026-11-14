import { Settings, Service, Industry, Product, User } from '../models/index.js';
import { defaultSettings, services, industries, products } from '../../../shared/content.js';

const ignoreDuplicates = (err) => {
  if (err?.code === 11000 || err?.writeErrors?.every?.((e) => e.code === 11000)) return;
  throw err;
};

/**
 * First-run setup, safe to call on every cold start:
 *  - on a brand-new database, inserts the default settings, services, industries and products;
 *  - if no admin user exists and ADMIN_EMAIL / ADMIN_PASSWORD are set, creates the admin.
 * Content is only inserted when the settings document does not exist yet, so content
 * you delete later is never re-created.
 */
export async function ensureSeed({ log = () => {} } = {}) {
  const hasSettings = await Settings.exists({ key: 'site' });
  if (!hasSettings) {
    await Settings.create({ key: 'site', ...defaultSettings }).catch(ignoreDuplicates);
    if ((await Service.countDocuments()) === 0) await Service.insertMany(services, { ordered: false }).catch(ignoreDuplicates);
    if ((await Industry.countDocuments()) === 0) await Industry.insertMany(industries, { ordered: false }).catch(ignoreDuplicates);
    if ((await Product.countDocuments()) === 0) await Product.insertMany(products, { ordered: false }).catch(ignoreDuplicates);
    log('[seed] default website content created');
  }
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 10 && (await User.countDocuments()) === 0) {
    await User.create({ name: ADMIN_NAME || 'Administrator', email: ADMIN_EMAIL.toLowerCase().trim(), password: ADMIN_PASSWORD, role: 'admin' }).catch(ignoreDuplicates);
    log(`[seed] admin user ${ADMIN_EMAIL} created`);
  }
}
