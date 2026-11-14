import { useEffect, useState } from 'react';
import { Building2, Globe, Home, Info, Phone, Save, Search, Share2, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SOCIAL } from '@/lib/icons';
import { useSite } from '@/context/SiteContext';
import { Alert, PageLoader, Spinner } from '@/components/ui/Feedback';
import { AField, ListEditor, ObjectListEditor, PageTitle, Toggle, useToast } from '../components/ui';
import { ImageField } from '../components/MediaPicker';

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setIn(obj, path, value) {
  const keys = path.split('.');
  const out = structuredClone(obj);
  let cur = out;
  keys.slice(0, -1).forEach((k) => { cur[k] = cur[k] && typeof cur[k] === 'object' ? cur[k] : {}; cur = cur[k]; });
  cur[keys.at(-1)] = value;
  return out;
}

const TABS = [
  { id: 'company', label: 'Company & About', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'social', label: 'Social Media', icon: Share2 },
  { id: 'home', label: 'Homepage', icon: Home },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'website', label: 'Website', icon: SlidersHorizontal },
];

const SEO_PAGES = [
  ['home', 'Home'], ['about', 'About Us'], ['services', 'Services'], ['industries', 'Industries'], ['products', 'Products'],
  ['projects', 'Projects'], ['contact', 'Contact'], ['quote', 'Request a Quote'], ['privacy', 'Privacy Policy'], ['terms', 'Terms & Conditions'],
];

function Section({ title, description, children }) {
  return (
    <section className="card p-6">
      <h2 className="font-display text-xl font-bold uppercase text-navy">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { reload } = useSite();
  const toast = useToast();
  const [tab, setTab] = useState('company');
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { api.get('/settings').then(setDraft).catch((e) => toast(e.message, 'error')); }, [toast]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!draft) return <PageLoader />;

  const val = (path) => get(draft, path);
  const set = (path) => (v) => { setDraft((d) => setIn(d, path, v)); setDirty(true); };
  const text = (path, label, opts = {}) => (
    <AField label={label} hint={opts.hint} error={errors[path]} className={opts.full ? 'sm:col-span-2' : ''}>
      {opts.rows ? (
        <textarea className="input resize-y" rows={opts.rows} value={val(path) || ''} onChange={(e) => set(path)(e.target.value)} placeholder={opts.placeholder} />
      ) : (
        <input className="input" type={opts.type || 'text'} value={val(path) || ''} onChange={(e) => set(path)(e.target.value)} placeholder={opts.placeholder} />
      )}
    </AField>
  );

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const updated = await api.put('/settings', { [tab]: draft[tab] });
      setDraft(updated);
      setDirty(false);
      reload();
      toast('Settings saved — changes are live on the website');
    } catch (e) {
      setErrors(e.errors || {});
      toast(e.message, 'error');
    } finally { setSaving(false); }
  }

  return (
    <>
      <PageTitle title="Settings & SEO" description="Company details, contact information, homepage content, social links and search engine settings."
        actions={<button type="button" className="btn btn-blue btn-sm" onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="size-4" />} Save {TABS.find((t) => t.id === tab).label}</button>} />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-1.5" role="tablist">
        {TABS.map(({ id, label, icon: I }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={cn('flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition', tab === id ? 'bg-navy text-white' : 'text-navy hover:bg-surface')}>
            <I className="size-4" /> {label}
          </button>
        ))}
      </div>
      {dirty && <Alert tone="info" className="mb-5">You have unsaved changes. Each tab is saved separately.</Alert>}
      {Object.keys(errors).length > 0 && <Alert className="mb-5">Some fields need attention: {Object.values(errors).join(' · ')}</Alert>}

      <div className="space-y-6">
        {tab === 'company' && (
          <>
            <Section title="Company">
              {text('company.name', 'Company name')}
              {text('company.tagline', 'Tagline')}
              {text('company.shortIntro', 'Short introduction (footer)', { rows: 3, full: true })}
              <div className="sm:col-span-2"><ImageField label="Logo" value={val('company.logo')} onChange={set('company.logo')} hint="Use the original logo file. It is displayed without recolouring or cropping." /></div>
            </Section>
            <Section title="About page">
              {text('company.about.heading', 'Heading', { full: true, hint: 'Wrap words in *asterisks* to show them in red.' })}
              <AField label="Paragraphs" className="sm:col-span-2"><ListEditor value={val('company.about.paragraphs') || []} onChange={set('company.about.paragraphs')} multiline placeholder="Add paragraph" max={10} /></AField>
              {text('company.about.mission', 'Mission', { rows: 3 })}
              {text('company.about.vision', 'Vision', { rows: 3 })}
              <AField label="Values" className="sm:col-span-2"><ObjectListEditor value={val('company.about.values') || []} onChange={set('company.about.values')} fields={[{ name: 'title', label: 'Title' }, { name: 'icon', label: 'Icon', type: 'icon' }, { name: 'text', label: 'Text', type: 'textarea', full: true }]} addLabel="Add value" max={8} /></AField>
            </Section>
          </>
        )}

        {tab === 'contact' && (
          <>
            <Alert tone="info"><Info className="mr-1 inline size-4" /> Only enter real contact details. Empty fields are hidden on the website and visitors are directed to the contact form instead.</Alert>
            <Section title="Phone, email & WhatsApp">
              {text('contact.phone', 'Phone number (for click-to-call)', { placeholder: '+92 300 1234567', hint: 'Include the country code.' })}
              {text('contact.phoneDisplay', 'Phone label shown on site (optional)', { placeholder: 'e.g. +92 300 123 4567' })}
              {text('contact.email', 'Email address', { type: 'email' })}
              {text('contact.whatsapp', 'WhatsApp number', { placeholder: '+92 300 1234567', hint: 'International format. Enables the WhatsApp button.' })}
              {text('contact.whatsappMessage', 'WhatsApp pre-filled message', { rows: 2, full: true })}
            </Section>
            <Section title="Location">
              {text('contact.address', 'Address', { rows: 2, full: true })}
              {text('contact.workingHours', 'Working hours', { placeholder: 'e.g. Mon–Sat, 9:00–18:00', full: true })}
              {text('contact.mapEmbedUrl', 'Google Maps embed URL', { full: true, hint: 'Google Maps → Share → Embed a map → copy only the src="…" URL (starts with https://www.google.com/maps/embed?).' })}
              {text('contact.mapLink', 'Google Maps link (for “Open in maps”)', { full: true, placeholder: 'https://maps.app.goo.gl/…' })}
            </Section>
          </>
        )}

        {tab === 'social' && (
          <Section title="Social media links" description="Full profile URLs. Leave blank to hide an icon.">
            {Object.entries(SOCIAL).map(([k, s]) => text(`social.${k}`, s.label, { placeholder: 'https://' }))}
          </Section>
        )}

        {tab === 'home' && (
          <>
            <Alert tone="info">Tip: in headings, wrap words in *asterisks* to show them in the brand red, e.g. <code>Our *Core* Services</code>.</Alert>
            <Section title="Top bar & hero">
              {text('home.topBarText', 'Top bar text', { full: true })}
              {text('home.hero.headingLine1', 'Hero heading — line 1 (white)')}
              {text('home.hero.headingLine2', 'Hero heading — line 2 (red)')}
              {text('home.hero.description', 'Hero description', { rows: 3, full: true })}
              {text('home.hero.primaryCta.label', 'Primary button label')}
              {text('home.hero.primaryCta.href', 'Primary button link')}
              {text('home.hero.secondaryCta.label', 'Secondary button label')}
              {text('home.hero.secondaryCta.href', 'Secondary button link')}
              <div className="sm:col-span-2"><ImageField label="Hero image" value={val('home.hero.image')} onChange={set('home.hero.image')} hint="Landscape photo, at least 1920px wide. The subject should be on the right side." /></div>
              {text('home.hero.imageAlt', 'Hero image alt text', { full: true })}
            </Section>
            <Section title="Service highlights bar">
              <AField className="sm:col-span-2"><ObjectListEditor value={val('home.highlights') || []} onChange={set('home.highlights')} fields={[{ name: 'title', label: 'Title' }, { name: 'icon', label: 'Icon', type: 'icon' }]} max={6} addLabel="Add highlight" /></AField>
            </Section>
            <Section title="Section headings">
              {text('home.servicesSection.heading', 'Services heading')}
              {text('home.servicesSection.subheading', 'Services subheading')}
              {text('home.industriesSection.heading', 'Industries heading')}
              {text('home.industriesSection.subheading', 'Industries subheading')}
            </Section>
            <Section title="Engineering expertise section">
              {text('home.expertise.heading', 'Heading', { full: true })}
              {text('home.expertise.description', 'Description', { rows: 3, full: true })}
              <AField label="Feature list" className="sm:col-span-2"><ListEditor value={val('home.expertise.features') || []} onChange={set('home.expertise.features')} max={8} /></AField>
              <div className="sm:col-span-2"><ImageField label="Image" value={val('home.expertise.image')} onChange={set('home.expertise.image')} /></div>
              {text('home.expertise.imageAlt', 'Image alt text', { full: true })}
            </Section>
            <Section title="Working process">
              {text('home.process.heading', 'Heading', { full: true })}
              <AField label="Steps" className="sm:col-span-2"><ObjectListEditor value={val('home.process.steps') || []} onChange={set('home.process.steps')} fields={[{ name: 'title', label: 'Step title' }, { name: 'text', label: 'Description', type: 'textarea', full: true }]} max={6} addLabel="Add step" /></AField>
            </Section>
            <Section title="Why choose us">
              {text('home.whyChoose.heading', 'Heading', { full: true })}
              <AField label="Reasons" className="sm:col-span-2"><ObjectListEditor value={val('home.whyChoose.items') || []} onChange={set('home.whyChoose.items')} fields={[{ name: 'title', label: 'Title' }, { name: 'icon', label: 'Icon', type: 'icon' }, { name: 'text', label: 'Text', type: 'textarea', full: true }]} max={8} addLabel="Add reason" /></AField>
              <div className="sm:col-span-2"><ImageField label="Background image" value={val('home.whyChoose.image')} onChange={set('home.whyChoose.image')} /></div>
            </Section>
            <Section title="Call-to-action banner">
              {text('home.cta.heading', 'Heading')}
              {text('home.cta.description', 'Description')}
              {text('home.cta.buttonLabel', 'Button label')}
              {text('home.cta.buttonHref', 'Button link')}
              <div className="sm:col-span-2"><ImageField label="Background image" value={val('home.cta.image')} onChange={set('home.cta.image')} /></div>
            </Section>
            <Section title="Company statistics (optional)" description="Animated counters appear on the homepage only when figures are added. Only enter real, verifiable numbers.">
              <AField className="sm:col-span-2"><ObjectListEditor value={val('home.stats') || []} onChange={set('home.stats')} fields={[{ name: 'label', label: 'Label (e.g. Projects completed)' }, { name: 'value', label: 'Number', type: 'number' }, { name: 'suffix', label: 'Suffix (e.g. +)' }]} newItem={{ label: '', value: 0, suffix: '' }} max={6} addLabel="Add statistic" /></AField>
            </Section>
          </>
        )}

        {tab === 'seo' && (
          <>
            <Section title="Global SEO">
              {text('seo.siteUrl', 'Website URL', { placeholder: 'https://www.yourdomain.com', hint: 'Used for canonical links, sitemap.xml and social sharing.' })}
              {text('seo.titleTemplate', 'Title template', { hint: '%s is replaced with the page title.' })}
              {text('seo.defaultTitle', 'Homepage / default title', { full: true })}
              {text('seo.defaultDescription', 'Default meta description', { rows: 3, full: true, hint: 'About 150–160 characters.' })}
              {text('seo.keywords', 'Keywords', { rows: 2, full: true })}
              <div className="sm:col-span-2"><ImageField label="Default social sharing image (Open Graph)" value={val('seo.ogImage')} onChange={set('seo.ogImage')} hint="1200×630 recommended." /></div>
            </Section>
            <Section title="Per-page titles & descriptions" description="Leave blank to use the defaults. Individual services and products have their own SEO fields.">
              {SEO_PAGES.map(([key, label]) => (
                <div key={key} className="rounded-lg border border-line p-4 sm:col-span-2">
                  <p className="mb-3 font-display font-bold uppercase text-brand"><Globe className="mr-1 inline size-4" />{label}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {text(`seo.pages.${key}.title`, 'Title')}
                    {text(`seo.pages.${key}.description`, 'Meta description', { rows: 2 })}
                  </div>
                </div>
              ))}
            </Section>
          </>
        )}

        {tab === 'website' && (
          <Section title="Website options">
            <div className="sm:col-span-2 space-y-4">
              <Toggle checked={val('website.showTopBar') !== false} onChange={set('website.showTopBar')} label="Show top information bar" />
              <Toggle checked={val('website.showWhatsAppButton') !== false} onChange={set('website.showWhatsAppButton')} label="Show floating WhatsApp button" description="Appears only when a WhatsApp number is set." />
            </div>
            {text('website.quoteSuccessMessage', 'Quote form success message', { rows: 3, full: true })}
            {text('website.contactSuccessMessage', 'Contact form success message', { rows: 3, full: true })}
            {text('website.footerNote', 'Footer note (optional)', { full: true, placeholder: 'e.g. company registration number' })}
          </Section>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" className="btn btn-blue" onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="size-4" />} Save Changes</button>
      </div>
    </>
  );
}
