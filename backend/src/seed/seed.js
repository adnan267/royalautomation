/**
 * Seeds MongoDB with the default website content and the first admin user.
 *
 *   npm run seed          -> inserts anything that is missing (safe to re-run)
 *   npm run seed:reset    -> wipes services/industries/products/settings and re-inserts defaults
 *
 * Admin credentials are read from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Settings, Service, Industry, Product, User } from '../models/index.js';
import { defaultSettings, services, industries, products } from '../../../shared/content.js';

const reset = process.argv.includes('--reset');

async function upsertMany(Model, docs, label) {
  let created = 0;
  for (const doc of docs) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Model.exists({ slug: doc.slug });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await Model.create(doc);
      created += 1;
    }
  }
  console.log(`[seed] ${label}: ${created} created, ${docs.length - created} already present`);
}

async function run() {
  await connectDB();

  if (reset) {
    await Promise.all([Service.deleteMany({}), Industry.deleteMany({}), Product.deleteMany({}), Settings.deleteMany({})]);
    console.log('[seed] reset: cleared services, industries, products and settings');
  }

  if (!(await Settings.exists({ key: 'site' }))) {
    await Settings.create({ key: 'site', ...defaultSettings });
    console.log('[seed] settings: created');
  } else console.log('[seed] settings: already present');

  await upsertMany(Service, services, 'services');
  await upsertMany(Industry, industries, 'industries');
  await upsertMany(Product, products, 'products');

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const email = ADMIN_EMAIL.toLowerCase().trim();
    if (await User.exists({ email })) console.log(`[seed] admin ${email}: already exists (password unchanged)`);
    else {
      if (ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
      await User.create({ name: ADMIN_NAME || 'Administrator', email, password: ADMIN_PASSWORD, role: 'admin' });
      console.log(`[seed] admin ${email}: created`);
    }
  } else {
    console.log('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user (run "npm run create-admin" later).');
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('[seed] failed:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
