import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter, formLimiter } from '../middleware/rateLimits.js';
import { attachmentUpload, mediaUpload, handleUploadErrors } from '../middleware/upload.js';
import * as S from '../validators/schemas.js';
import { QUOTE_STATUSES } from '../models/Quote.js';
import { INQUIRY_STATUSES } from '../models/Inquiry.js';
import { Service, Industry, Product, Project } from '../models/index.js';
import * as auth from '../controllers/authController.js';
import * as settings from '../controllers/settingsController.js';
import { crudFactory } from '../controllers/crudFactory.js';
import * as subs from '../controllers/submissionsController.js';
import * as media from '../controllers/mediaController.js';
import * as dashboard from '../controllers/dashboardController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

/* Auth */
router.post('/auth/login', loginLimiter, validate(S.loginSchema), auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAuth, auth.me);
router.put('/auth/password', requireAuth, validate(S.changePasswordSchema), auth.changePassword);

/* Settings */
router.get('/settings', settings.getSettings);
router.put('/settings', requireAuth, validate(S.settingsSchema), settings.updateSettings);

/* Content collections */
const collections = [
  ['services', Service, S.serviceSchema, { label: 'Service', searchFields: ['title', 'excerpt'] }],
  ['industries', Industry, S.industrySchema, { label: 'Industry', searchFields: ['title', 'excerpt'] }],
  ['products', Product, S.productSchema, { label: 'Product', titleField: 'name', searchFields: ['name', 'category', 'brand', 'partNumber', 'excerpt'], filters: ['category'] }],
  ['projects', Project, S.projectSchema, { label: 'Project', searchFields: ['title', 'client', 'industry', 'summary'], filters: ['industry'] }],
];
for (const [path, Model, schema, opts] of collections) {
  const c = crudFactory(Model, opts);
  router.get(`/${path}`, optionalAuth, c.list);
  router.get(`/${path}/:idOrSlug`, optionalAuth, c.getOne);
  router.post(`/${path}`, requireAuth, validate(schema), c.create);
  router.put(`/${path}/:id`, requireAuth, validate(schema), c.update);
  router.delete(`/${path}/:id`, requireAuth, c.remove);
}

/* Quote requests */
router.post('/quotes', formLimiter, handleUploadErrors(attachmentUpload.array('attachments', 5)), subs.createQuote);
router.get('/quotes', requireAuth, subs.quoteAdmin.list);
router.get('/quotes/:id', requireAuth, subs.quoteAdmin.getOne);
router.patch('/quotes/:id', requireAuth, validate(S.statusUpdateSchema(QUOTE_STATUSES)), subs.quoteAdmin.update);
router.delete('/quotes/:id', requireAuth, subs.quoteAdmin.remove);
router.get('/quotes/:id/attachments/:filename', requireAuth, subs.downloadAttachment);

/* Contact inquiries */
router.post('/inquiries', formLimiter, validate(S.inquirySchema), subs.createInquiry);
router.get('/inquiries', requireAuth, subs.inquiryAdmin.list);
router.get('/inquiries/:id', requireAuth, subs.inquiryAdmin.getOne);
router.patch('/inquiries/:id', requireAuth, validate(S.statusUpdateSchema(INQUIRY_STATUSES)), subs.inquiryAdmin.update);
router.delete('/inquiries/:id', requireAuth, subs.inquiryAdmin.remove);

/* Media library */
router.get('/media', requireAuth, media.listMedia);
router.post('/media', requireAuth, handleUploadErrors(mediaUpload.array('files', 10)), media.uploadMedia);
router.patch('/media/:id', requireAuth, media.updateMedia);
router.delete('/media/:id', requireAuth, media.deleteMedia);

/* Dashboard */
router.get('/dashboard/stats', requireAuth, dashboard.stats);

export default router;
