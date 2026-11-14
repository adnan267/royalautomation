/**
 * End-to-end smoke test for the REST API.
 * Start the server first (npm run dev), then:  API_URL=http://localhost:5000 ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run test:api
 */
import 'dotenv/config';
import sharp from 'sharp';

const API = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
let cookie = '';
let passed = 0;
let failed = 0;

async function call(method, path, { body, form, auth = true } = {}) {
  const headers = {};
  if (auth && cookie) headers.cookie = cookie;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(API + path, { method, headers, body: payload });
  const set = res.headers.get('set-cookie');
  if (set) cookie = set.split(';')[0];
  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : await res.text();
  return { status: res.status, data, headers: res.headers };
}

function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  ✔ ${name}`); }
  else { failed++; console.log(`  ✘ ${name} ${extra}`); }
}

async function run() {
  console.log(`Testing ${API}\n`);
  let r = await call('GET', '/api/health');
  check('health', r.status === 200 && r.data.ok);

  r = await call('GET', '/api/settings');
  check('public settings', r.status === 200 && r.data.company?.name === 'The Royal Automation');

  r = await call('GET', '/api/services');
  check('list services', r.status === 200 && r.data.items.length >= 10, `got ${r.data.items?.length}`);
  r = await call('GET', '/api/services?featured=true');
  check('featured services = 6', r.data.items?.length === 6, `got ${r.data.items?.length}`);
  r = await call('GET', '/api/services/vfd-servo-drive-repair');
  check('service by slug', r.status === 200 && r.data.title === 'VFD & Servo Drive Repair');
  r = await call('GET', '/api/services/does-not-exist');
  check('unknown service -> 404', r.status === 404);
  r = await call('GET', '/api/industries');
  check('list industries', r.data.items?.length === 6);
  r = await call('GET', '/api/products?category=Drives%20%26%20Motion');
  check('filter products by category', r.data.items?.length === 2, `got ${r.data.items?.length}`);

  r = await call('GET', '/api/quotes');
  check('admin route without auth -> 401', r.status === 401);
  r = await call('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: 'wrong-password' } });
  check('bad login -> 401', r.status === 401);
  r = await call('POST', '/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
  check('login ok + httpOnly cookie', r.status === 200 && cookie.startsWith('ra_admin=') && /HttpOnly/i.test(r.headers.get('set-cookie')));
  r = await call('GET', '/api/auth/me');
  check('me', r.status === 200 && r.data.user.email === process.env.ADMIN_EMAIL);
  check('password hash never returned', !JSON.stringify(r.data).includes('$2'));

  // CRUD
  r = await call('POST', '/api/services', { body: { title: 'Test Service', excerpt: 'x', features: ['a'], published: false } });
  check('create service', r.status === 201 && r.data.slug === 'test-service', JSON.stringify(r.data));
  const sid = r.data._id;
  r = await call('POST', '/api/services', { body: { title: 'Test Service' } });
  check('duplicate title gets unique slug', r.data.slug === 'test-service-2');
  await call('DELETE', `/api/services/${r.data._id}`);
  r = await call('GET', '/api/services/test-service', { auth: false });
  check('unpublished hidden from public', r.status === 404);
  r = await call('PUT', `/api/services/${sid}`, { body: { title: 'Test Service Updated', slug: 'test-service', published: true } });
  check('update service', r.status === 200 && r.data.title === 'Test Service Updated');
  r = await call('POST', '/api/services', { body: { title: '' } });
  check('validation error -> 422 with field', r.status === 422 && r.data.errors?.title);
  r = await call('DELETE', `/api/services/${sid}`);
  check('delete service', r.status === 200);

  // Settings
  r = await call('PUT', '/api/settings', { body: { contact: { email: 'not-an-email' } } });
  check('settings validation', r.status === 422 && r.data.errors?.['contact.email']);
  r = await call('PUT', '/api/settings', { body: { contact: { phone: '+92 300 0000000' }, website: { showTopBar: true } } });
  check('settings update merges', r.status === 200 && r.data.contact.phone === '+92 300 0000000' && r.data.contact.whatsappMessage);
  await call('PUT', '/api/settings', { body: { contact: { phone: '' } } });

  // Quote with attachment (public)
  const pdf = new Blob([Buffer.from('%PDF-1.4\n% test\n')], { type: 'application/pdf' });
  const form = new FormData();
  Object.entries({
    fullName: 'Test Customer', companyName: 'Test Co', email: 'customer@example.com', phone: '+1 555 0100',
    industry: 'Manufacturing & Factories', service: 'VFD & Servo Drive Repair', equipmentDetails: 'AC drive 15kW',
    problemDescription: 'Drive trips on over-current at start-up.', preferredContact: 'whatsapp', website: '',
  }).forEach(([k, v]) => form.append(k, v));
  form.append('attachments', pdf, 'nameplate.pdf');
  r = await call('POST', '/api/quotes', { form, auth: false });
  check('submit quote with attachment', r.status === 201 && /^RA-Q-/.test(r.data.reference), JSON.stringify(r.data));

  const bad = new FormData();
  bad.append('fullName', 'X'); bad.append('email', 'nope'); bad.append('phone', 'abc');
  r = await call('POST', '/api/quotes', { form: bad, auth: false });
  check('invalid quote -> 422', r.status === 422 && r.data.errors?.email && r.data.errors?.phone);

  const exe = new FormData();
  Object.entries({ fullName: 'Test', email: 'a@b.co', phone: '12345678', problemDescription: 'something broken here' }).forEach(([k, v]) => exe.append(k, v));
  exe.append('attachments', new Blob(['MZ'], { type: 'application/x-msdownload' }), 'virus.exe');
  r = await call('POST', '/api/quotes', { form: exe, auth: false });
  check('disallowed attachment type -> 415', r.status === 415);

  const lim = (await call('GET', '/api/settings', { auth: false })).data.limits;
  const perFile = Math.min(lim.maxUploadMb * 0.9, lim.maxTotalMb / 2 + 0.3);
  const count = Math.min(lim.maxFiles, Math.floor(lim.maxTotalMb / perFile) + 1);
  const big = new FormData();
  Object.entries({ fullName: 'Big Files', email: 'big@example.com', phone: '12345678', problemDescription: 'several large attachments here' }).forEach(([k, v]) => big.append(k, v));
  const chunk = Buffer.alloc(Math.round(perFile * 1024 * 1024), 65);
  for (let i = 0; i < count; i++) big.append('attachments', new Blob([chunk], { type: 'text/plain' }), `f${i}.txt`);
  r = await call('POST', '/api/quotes', { form: big, auth: false });
  check(`total attachment size limit enforced (${lim.maxTotalMb} MB)`, r.status === 413, `got ${r.status}`);

  r = await call('GET', '/api/settings', { auth: false });
  check('upload limits exposed to the website', r.data.limits?.maxUploadMb > 0);

  r = await call('GET', '/api/quotes?status=new');
  check('admin lists quotes', r.status === 200 && r.data.total >= 1 && r.data.counts.new >= 1);
  const q = r.data.items[0];
  r = await call('PATCH', `/api/quotes/${q._id}`, { body: { status: 'in_review', note: 'Called customer' } });
  check('update quote status + note', r.status === 200 && r.data.status === 'in_review' && r.data.notes.length === 2);
  r = await call('GET', `/api/quotes/${q._id}/attachments/${q.attachments[0].filename}`);
  check('download attachment (admin)', r.status === 200 && String(r.data).startsWith('%PDF'));
  r = await call('GET', `/uploads/attachments/${q.attachments[0].filename}`, { auth: false });
  check('attachments not publicly served', r.status === 404);

  // Inquiry
  r = await call('POST', '/api/inquiries', { body: { name: 'Jane', email: 'jane@example.com', message: 'Please call me about a PLC upgrade.' }, auth: false });
  check('submit contact inquiry', r.status === 201 && /^RA-C-/.test(r.data.reference));
  r = await call('POST', '/api/inquiries', { body: { name: 'Bot', email: 'b@b.co', message: 'spam spam spam', website: 'http://spam' }, auth: false });
  check('honeypot blocks bots', r.status === 422);
  r = await call('POST', '/api/inquiries', { body: { name: 'Mongo', email: { $gt: '' }, message: 'injection attempt here' }, auth: false });
  check('operator injection rejected', r.status === 422);

  // Media upload (sharp optimisation)
  const png = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: '#0865A9' } }).png().toBuffer();
  const mf = new FormData();
  mf.append('files', new Blob([png], { type: 'image/png' }), 'panel.png');
  mf.append('alt', 'Blue test image');
  r = await call('POST', '/api/media', { form: mf });
  check('media upload converts to webp + resizes', r.status === 201 && r.data.items[0].mimetype === 'image/webp' && r.data.items[0].width === 2400, JSON.stringify(r.data));
  const m = r.data.items?.[0];
  if (m) {
    r = await call('GET', m.url, { auth: false });
    check('media publicly served', r.status === 200);
    r = await call('DELETE', `/api/media/${m._id}`);
    check('media delete', r.status === 200);
  }

  r = await call('GET', '/api/dashboard/stats');
  check('dashboard stats', r.status === 200 && r.data.quotes.total >= 1 && r.data.content.services >= 10);

  // Cleanup test submissions
  await call('DELETE', `/api/quotes/${q._id}`);
  const inq = await call('GET', '/api/inquiries?q=jane');
  for (const i of inq.data.items || []) await call('DELETE', `/api/inquiries/${i._id}`);

  r = await call('GET', '/sitemap.xml', { auth: false });
  check('sitemap.xml', r.status === 200 && r.data.includes('/services/plc-programming-automation'));
  r = await call('GET', '/robots.txt', { auth: false });
  check('robots.txt', r.status === 200 && r.data.includes('Sitemap:'));

  r = await call('POST', '/api/auth/logout');
  cookie = '';
  r = await call('GET', '/api/auth/me');
  check('logout', r.status === 401);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((e) => { console.error(e); process.exit(1); });
