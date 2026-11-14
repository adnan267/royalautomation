/**
 * Creates (or resets the password of) an admin user.
 *
 *   npm run create-admin -- --email you@company.com --name "Your Name" --password "a-strong-password"
 *
 * Any argument not supplied falls back to ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD in .env.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/index.js';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function run() {
  const email = (arg('email') || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = arg('password') || process.env.ADMIN_PASSWORD;
  const name = arg('name') || process.env.ADMIN_NAME || 'Administrator';
  if (!email || !password) throw new Error('Provide --email and --password (or set ADMIN_EMAIL / ADMIN_PASSWORD).');
  if (password.length < 10) throw new Error('Password must be at least 10 characters.');

  await connectDB();
  let user = await User.findOne({ email }).select('+password');
  if (user) {
    user.password = password;
    user.name = name;
    await user.save();
    console.log(`[admin] password reset for ${email}`);
  } else {
    user = await User.create({ email, password, name, role: 'admin' });
    console.log(`[admin] created ${email}`);
  }
  await disconnectDB();
}

run().catch(async (err) => {
  console.error('[admin] failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
