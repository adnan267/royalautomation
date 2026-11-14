import { z } from 'zod';

const str = (max = 500) => z.string().trim().max(max);
const optStr = (max = 500) => str(max).optional().default('');
const strList = (maxItems = 50, max = 600) => z.array(str(max)).max(maxItems).optional().default([]);
// Images may be absolute URLs or site-relative paths such as /uploads/media/x.webp
const imageRef = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || /^https?:\/\//i.test(v) || v.startsWith('/'), 'Must be a URL or a site path starting with /')
  .optional()
  .default('');
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')
  .optional()
  .or(z.literal(''));
const phone = z
  .string()
  .trim()
  .min(6, 'Please enter a valid phone number')
  .max(40)
  .regex(/^[+()\d\s-]+$/, 'Phone number may contain digits, spaces, +, - and brackets only');

/* ------------------------------ Auth ------------------------------ */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(10, 'Use at least 10 characters')
      .max(200)
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
  })
  .refine((d) => d.currentPassword !== d.newPassword, { message: 'New password must be different', path: ['newPassword'] });

/* ---------------------------- Content ----------------------------- */
const base = {
  slug,
  published: z.boolean().optional().default(true),
  order: z.coerce.number().int().min(0).max(10000).optional().default(0),
};

export const serviceSchema = z.object({
  ...base,
  title: str(140).min(2, 'Title is required'),
  cardTitle: optStr(140),
  icon: optStr(40),
  image: imageRef,
  imageAlt: optStr(200),
  excerpt: optStr(400),
  intro: optStr(2000),
  description: strList(10, 3000),
  features: strList(30, 300),
  benefits: strList(30, 300),
  related: strList(10, 120),
  featured: z.boolean().optional().default(false),
  seoTitle: optStr(120),
  seoDescription: optStr(320),
});

export const industrySchema = z.object({
  ...base,
  title: str(140).min(2, 'Title is required'),
  icon: optStr(40),
  image: imageRef,
  imageAlt: optStr(200),
  excerpt: optStr(400),
  description: optStr(4000),
  applications: strList(30, 300),
});

export const productSchema = z.object({
  ...base,
  name: str(160).min(2, 'Name is required'),
  category: optStr(80),
  brand: optStr(80),
  partNumber: optStr(80),
  image: imageRef,
  gallery: z.array(imageRef).max(12).optional().default([]),
  imageAlt: optStr(200),
  excerpt: optStr(400),
  description: optStr(6000),
  features: strList(30, 300),
  applications: strList(30, 300),
  specifications: z
    .array(z.object({ label: str(80), value: str(200) }))
    .max(40)
    .optional()
    .default([]),
  availability: optStr(80),
  featured: z.boolean().optional().default(false),
  seoTitle: optStr(120),
  seoDescription: optStr(320),
});

export const projectSchema = z.object({
  ...base,
  title: str(160).min(2, 'Title is required'),
  client: optStr(120),
  industry: optStr(120),
  location: optStr(120),
  completedOn: optStr(40),
  image: imageRef,
  gallery: z.array(imageRef).max(20).optional().default([]),
  summary: optStr(600),
  challenge: optStr(4000),
  solution: optStr(4000),
  outcome: optStr(4000),
  services: strList(15, 160),
  featured: z.boolean().optional().default(false),
});

/* ------------------------- Public forms --------------------------- */
const honeypot = z.string().max(0, 'Invalid submission').optional().default('');

export const quoteSchema = z.object({
  fullName: str(120).min(2, 'Please enter your full name'),
  companyName: optStr(160),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  phone,
  industry: optStr(120),
  service: optStr(160),
  equipmentDetails: optStr(3000),
  problemDescription: str(6000).min(10, 'Please describe the problem (at least 10 characters)'),
  preferredContact: z.enum(['email', 'phone', 'whatsapp']).optional().default('email'),
  website: honeypot,
});

export const inquirySchema = z.object({
  name: str(120).min(2, 'Please enter your name'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  phone: z.union([phone, z.literal('')]).optional().default(''),
  company: optStr(160),
  subject: optStr(200),
  message: str(6000).min(10, 'Please enter a message (at least 10 characters)'),
  website: honeypot,
});

export const statusUpdateSchema = (statuses) =>
  z
    .object({
      status: z.enum(statuses).optional(),
      note: str(4000).optional(),
    })
    .refine((d) => d.status || d.note, { message: 'Provide a status or a note' });

/* ---------------------------- Settings ---------------------------- */
// Settings are partial updates: no defaults here, so omitted keys keep their stored values.
const sStr = (max = 500) => z.string().trim().max(max);
const sImage = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === '' || /^https?:\/\//i.test(v) || v.startsWith('/'), 'Must be a URL or a site path starting with /');
const sList = (maxItems = 50, max = 600) => z.array(sStr(max)).max(maxItems);
const link = z.object({ label: sStr(60), href: sStr(300) }).partial();
const titled = z.object({ title: sStr(120), text: sStr(400), icon: sStr(40) }).partial();
const pageSeo = z.object({ title: sStr(120), description: sStr(320) }).partial();

export const settingsSchema = z
  .object({
    company: z
      .object({
        name: sStr(120),
        tagline: sStr(160),
        logo: sImage,
        shortIntro: sStr(400),
        about: z
          .object({
            heading: sStr(160),
            paragraphs: sList(10, 2000),
            mission: sStr(800),
            vision: sStr(800),
            values: z.array(titled).max(8).optional(),
          })
          .partial(),
      })
      .partial(),
    contact: z
      .object({
        phone: z.string().trim().max(40).regex(/^[+()\d\s-]*$/, 'Phone may contain digits, spaces, +, - and brackets'),
        phoneDisplay: sStr(60),
        email: z.union([z.string().trim().email('Enter a valid email'), z.literal('')]),
        whatsapp: z.string().trim().max(30).regex(/^[+\d\s-]*$/, 'WhatsApp number may contain digits, spaces, + and -'),
        whatsappMessage: sStr(300),
        address: sStr(400),
        workingHours: sStr(200),
        mapEmbedUrl: z
          .string()
          .trim()
          .max(2000)
          .refine(
            (v) => v === '' || /^https:\/\/(www\.)?google\.[a-z.]+\/maps(\/embed|\?.*output=embed)/i.test(v),
            'Paste the “Embed a map” URL from Google Maps (https://www.google.com/maps/embed?...)',
          ),
        mapLink: z.union([z.string().trim().url(), z.literal('')]),
      })
      .partial(),
    social: z.record(z.string(), z.union([z.string().trim().url('Enter a full URL starting with https://'), z.literal('')])),
    home: z
      .object({
        topBarText: sStr(160),
        hero: z
          .object({
            headingLine1: sStr(80),
            headingLine2: sStr(80),
            description: sStr(400),
            primaryCta: link,
            secondaryCta: link,
            image: sImage,
            imageAlt: sStr(200),
          })
          .partial(),
        highlights: z.array(titled).max(6),
        servicesSection: z.object({ heading: sStr(120), subheading: sStr(300) }).partial(),
        industriesSection: z.object({ heading: sStr(120), subheading: sStr(300) }).partial(),
        expertise: z
          .object({ heading: sStr(120), description: sStr(600), features: sList(8, 120), image: sImage, imageAlt: sStr(200) })
          .partial(),
        process: z.object({ heading: sStr(120), steps: z.array(titled).max(6) }).partial(),
        whyChoose: z.object({ heading: sStr(120), items: z.array(titled).max(8), image: sImage }).partial(),
        cta: z
          .object({ heading: sStr(120), description: sStr(300), buttonLabel: sStr(60), buttonHref: sStr(300), image: sImage })
          .partial(),
        stats: z
          .array(z.object({ label: str(80), value: z.coerce.number().min(0).max(1e9), suffix: sStr(10) }))
          .max(6),
      })
      .partial(),
    website: z
      .object({
        showWhatsAppButton: z.boolean(),
        showTopBar: z.boolean(),
        quoteSuccessMessage: sStr(500),
        contactSuccessMessage: sStr(500),
        footerNote: sStr(300),
      })
      .partial(),
    seo: z
      .object({
        siteUrl: z.union([z.string().trim().url(), z.literal('')]),
        defaultTitle: sStr(120),
        titleTemplate: sStr(120),
        defaultDescription: sStr(320),
        ogImage: sImage,
        keywords: sStr(600),
        pages: z.record(z.string(), pageSeo),
      })
      .partial(),
  })
  .partial();
