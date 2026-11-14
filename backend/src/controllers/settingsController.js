import { Settings } from '../models/index.js';
import { defaultSettings } from '../../../shared/content.js';
import { deepMerge } from '../utils/merge.js';
import { env } from '../config/env.js';

const SECTIONS = ['company', 'contact', 'social', 'home', 'website', 'seo'];

export async function getSettingsDoc() {
  let doc = await Settings.findOne({ key: 'site' });
  if (!doc) doc = await Settings.create({ key: 'site', ...defaultSettings });
  return doc;
}

/** Stored settings layered over defaults so newly added keys always exist. */
export async function getMergedSettings() {
  const doc = await getSettingsDoc();
  const out = {};
  for (const s of SECTIONS) out[s] = deepMerge(defaultSettings[s], doc[s] || {});
  out.updatedAt = doc.updatedAt;
  return out;
}

export async function getSettings(_req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({ ...(await getMergedSettings()), limits: { maxUploadMb: env.maxUploadMb, maxTotalMb: env.maxTotalMb, maxFiles: env.maxFiles } });
}

export async function updateSettings(req, res) {
  const doc = await getSettingsDoc();
  for (const [section, value] of Object.entries(req.validated)) {
    if (!SECTIONS.includes(section) || value === undefined) continue;
    doc[section] = deepMerge(doc[section] || {}, value);
    doc.markModified(section);
  }
  await doc.save();
  res.json(await getMergedSettings());
}
