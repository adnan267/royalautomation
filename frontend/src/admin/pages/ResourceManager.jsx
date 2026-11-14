import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { Icon } from '@/lib/icons';
import { useSite } from '@/context/SiteContext';
import SmartImage from '@/components/ui/SmartImage';
import { Spinner } from '@/components/ui/Feedback';
import { productCategories } from '@shared/content.js';
import { AField, Drawer, IconSelect, ListEditor, LoadingRow, ObjectListEditor, PageTitle, Toggle, useConfirm, useToast } from '../components/ui';
import { ImageField } from '../components/MediaPicker';

/* Field types: text, textarea, list, paragraphs, image, gallery, icon, number, toggle, select, specs, slug */
const SEO_FIELDS = [
  { name: 'seoTitle', label: 'SEO title', type: 'text', hint: 'Optional. Defaults to the title.', section: 'SEO' },
  { name: 'seoDescription', label: 'SEO meta description', type: 'textarea', hint: 'Optional, ~150 characters. Defaults to the short description.', section: 'SEO' },
];

const RESOURCES = {
  services: {
    title: 'Services', singular: 'Service', titleField: 'title', path: '/services',
    description: 'Services shown on the Services pages, homepage and navigation. “Featured” services appear on the homepage (up to 6).',
    blank: { title: '', cardTitle: '', icon: 'Settings', image: '', imageAlt: '', excerpt: '', intro: '', description: [''], features: [], benefits: [], related: [], featured: false, published: true, order: 0, seoTitle: '', seoDescription: '' },
    fields: [
      { name: 'title', label: 'Service title', type: 'text', required: true },
      { name: 'cardTitle', label: 'Homepage card title', type: 'text', hint: 'Optional shorter/alternative title for the homepage card.' },
      { name: 'slug', label: 'URL slug', type: 'slug' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'image', label: 'Hero / card image', type: 'image', full: true },
      { name: 'imageAlt', label: 'Image alt text', type: 'text', full: true, hint: 'Describe the photo for accessibility and SEO.' },
      { name: 'excerpt', label: 'Short description', type: 'textarea', full: true, hint: 'Shown on cards and as the page subtitle.' },
      { name: 'intro', label: 'Service introduction', type: 'textarea', full: true },
      { name: 'description', label: 'Detailed description (paragraphs)', type: 'paragraphs', full: true },
      { name: 'features', label: 'Key features', type: 'list', full: true },
      { name: 'benefits', label: 'Benefits', type: 'list', full: true },
      { name: 'related', label: 'Related services', type: 'related', full: true },
      { name: 'order', label: 'Display order', type: 'number' },
      { name: 'featured', label: 'Show on homepage', type: 'toggle' },
      { name: 'published', label: 'Published', type: 'toggle' },
      ...SEO_FIELDS,
    ],
  },
  industries: {
    title: 'Industries', singular: 'Industry', titleField: 'title', path: '/industries#',
    description: 'Industries shown on the homepage and the Industries page.',
    blank: { title: '', icon: 'Factory', image: '', imageAlt: '', excerpt: '', description: '', applications: [], published: true, order: 0 },
    fields: [
      { name: 'title', label: 'Industry name', type: 'text', required: true },
      { name: 'slug', label: 'Anchor slug', type: 'slug' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'order', label: 'Display order', type: 'number' },
      { name: 'image', label: 'Image', type: 'image', full: true },
      { name: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
      { name: 'excerpt', label: 'Short description', type: 'textarea', full: true },
      { name: 'description', label: 'Full description', type: 'textarea', full: true, rows: 5 },
      { name: 'applications', label: 'Typical support areas', type: 'list', full: true },
      { name: 'published', label: 'Published', type: 'toggle' },
    ],
  },
  products: {
    title: 'Store Products', singular: 'Product', titleField: 'name', path: '/store/',
    description: 'Products shown in the online store. Set a price to show it (leave empty for “Price on request”). Customers order on WhatsApp.',
    blank: { name: '', category: productCategories[0], brand: '', partNumber: '', price: null, oldPrice: null, unit: '', stockStatus: 'in_stock', image: '', gallery: [], imageAlt: '', excerpt: '', description: '', features: [], applications: [], specifications: [], availability: 'Enquire for availability', featured: false, published: true, order: 0, seoTitle: '', seoDescription: '' },
    fields: [
      { name: 'name', label: 'Product name', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'slug' },
      { name: 'category', label: 'Category', type: 'select', options: productCategories, allowCustom: true },
      { name: 'stockStatus', label: 'Stock status', type: 'choice', options: [['in_stock', 'In stock'], ['limited', 'Limited stock'], ['on_order', 'Available on order'], ['out_of_stock', 'Out of stock'], ['', 'Not shown (use availability label)']] },
      { name: 'price', label: 'Price', type: 'money', hint: 'In the store currency (Settings → Website). Leave empty for “Price on request”.' },
      { name: 'oldPrice', label: 'Old price (optional)', type: 'money', hint: 'Shown crossed out, for discounts.' },
      { name: 'unit', label: 'Price unit (optional)', type: 'text', hint: 'e.g. piece, set, metre' },
      { name: 'availability', label: 'Availability label', type: 'text', hint: 'Shown when stock status is “Not shown”.' },
      { name: 'brand', label: 'Brand (optional)', type: 'text' },
      { name: 'partNumber', label: 'Part / model number (optional)', type: 'text' },
      { name: 'image', label: 'Main image', type: 'image', full: true },
      { name: 'gallery', label: 'Additional images', type: 'gallery', full: true },
      { name: 'imageAlt', label: 'Image alt text', type: 'text', full: true },
      { name: 'excerpt', label: 'Short description', type: 'textarea', full: true },
      { name: 'description', label: 'Full description', type: 'textarea', full: true, rows: 5 },
      { name: 'features', label: 'Highlights', type: 'list', full: true },
      { name: 'applications', label: 'Applications', type: 'list', full: true },
      { name: 'specifications', label: 'Specifications', type: 'specs', full: true },
      { name: 'order', label: 'Display order', type: 'number' },
      { name: 'featured', label: 'Featured (shown first)', type: 'toggle' },
      { name: 'published', label: 'Published', type: 'toggle' },
      ...SEO_FIELDS,
    ],
  },
  brands: {
    title: 'Brands', singular: 'Brand', titleField: 'name', imageField: 'logo', path: null,
    description: 'Brands shown in the sliding strip on the homepage and store. Upload each brand’s official logo (PNG/SVG with transparent background works best) and remove brands you don’t support.',
    blank: { name: '', logo: '', website: '', published: true, order: 0 },
    fields: [
      { name: 'name', label: 'Brand name', type: 'text', required: true },
      { name: 'order', label: 'Display order', type: 'number' },
      { name: 'logo', label: 'Logo', type: 'image', full: true, hint: 'Without a logo, the brand name is shown as text.' },
      { name: 'website', label: 'Website link (optional)', type: 'text', full: true },
      { name: 'published', label: 'Published', type: 'toggle' },
    ],
  },
  projects: {
    title: 'Projects', singular: 'Project', titleField: 'title', path: '/projects/',
    description: 'Case studies shown on the Projects page. Only publish real projects you have permission to share.',
    blank: { title: '', client: '', industry: '', location: '', completedOn: '', image: '', gallery: [], summary: '', challenge: '', solution: '', outcome: '', services: [], featured: false, published: true, order: 0 },
    fields: [
      { name: 'title', label: 'Project title', type: 'text', required: true },
      { name: 'slug', label: 'URL slug', type: 'slug' },
      { name: 'client', label: 'Client (optional)', type: 'text', hint: 'Leave blank if the client should stay confidential.' },
      { name: 'industry', label: 'Industry', type: 'industry' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'completedOn', label: 'Completed (e.g. March 2026)', type: 'text' },
      { name: 'image', label: 'Main image', type: 'image', full: true },
      { name: 'gallery', label: 'Gallery', type: 'gallery', full: true },
      { name: 'summary', label: 'Summary', type: 'textarea', full: true },
      { name: 'challenge', label: 'The challenge', type: 'textarea', full: true, rows: 5 },
      { name: 'solution', label: 'Our solution', type: 'textarea', full: true, rows: 5 },
      { name: 'outcome', label: 'The outcome', type: 'textarea', full: true, rows: 4 },
      { name: 'services', label: 'Services delivered', type: 'list', full: true },
      { name: 'order', label: 'Display order', type: 'number' },
      { name: 'published', label: 'Published', type: 'toggle' },
    ],
  },
};

function GalleryEditor({ value = [], onChange }) {
  return (
    <div className="space-y-3">
      {value.map((src, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="rounded-lg border border-line p-3">
          <ImageField label="" value={src} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)).filter((x, j) => x || j !== i))} />
        </div>
      ))}
      <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-brand/50 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-50" onClick={() => onChange([...value, ''])}><Plus className="size-4" /> Add image</button>
    </div>
  );
}

function Editor({ cfg, value, setValue, errors }) {
  const { services, industries } = useSite();
  const set = (k) => (v) => setValue((d) => ({ ...d, [k]: v }));
  const sections = useMemo(() => {
    const main = cfg.fields.filter((f) => !f.section);
    const seo = cfg.fields.filter((f) => f.section === 'SEO');
    return [['Content', main], ...(seo.length ? [['Search engine (SEO)', seo]] : [])];
  }, [cfg]);

  const render = (f) => {
    const v = value[f.name];
    switch (f.type) {
      case 'textarea': return <textarea className="input resize-y" rows={f.rows || 3} value={v || ''} onChange={(e) => set(f.name)(e.target.value)} />;
      case 'list': return <ListEditor value={v || []} onChange={set(f.name)} placeholder="Add item" />;
      case 'paragraphs': return <ListEditor value={v || []} onChange={set(f.name)} placeholder="Add paragraph" multiline max={10} />;
      case 'image': return <ImageField label="" value={v} onChange={set(f.name)} />;
      case 'gallery': return <GalleryEditor value={v || []} onChange={set(f.name)} />;
      case 'icon': return <IconSelect value={v} onChange={set(f.name)} />;
      case 'number': return <input type="number" min="0" className="input" value={v ?? 0} onChange={(e) => set(f.name)(Number(e.target.value))} />;
      case 'money': return <input type="number" min="0" step="0.001" inputMode="decimal" className="input" value={v ?? ''} placeholder="Price on request" onChange={(e) => set(f.name)(e.target.value === '' ? null : Number(e.target.value))} />;
      case 'choice': return <select className="input" value={v ?? ''} onChange={(e) => set(f.name)(e.target.value)}>{f.options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}</select>;
      case 'toggle': return <Toggle checked={!!v} onChange={set(f.name)} label={f.label} />;
      case 'slug': return <input className="input font-mono text-sm" value={v || ''} onChange={(e) => set(f.name)(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="auto-generated from title" />;
      case 'specs': return <ObjectListEditor value={v || []} onChange={set(f.name)} fields={[{ name: 'label', label: 'Label' }, { name: 'value', label: 'Value' }]} addLabel="Add specification" max={40} />;
      case 'select': {
        const opts = [...new Set([...(f.options || []), v].filter(Boolean))];
        return (
          <>
            <input className="input" list={`${f.name}-opts`} value={v || ''} onChange={(e) => set(f.name)(e.target.value)} />
            <datalist id={`${f.name}-opts`}>{opts.map((o) => <option key={o} value={o} />)}</datalist>
          </>
        );
      }
      case 'industry': return (
        <>
          <input className="input" list="industry-opts" value={v || ''} onChange={(e) => set(f.name)(e.target.value)} />
          <datalist id="industry-opts">{industries.map((i) => <option key={i.slug} value={i.title} />)}</datalist>
        </>
      );
      case 'related': return (
        <div className="grid gap-2 sm:grid-cols-2">
          {services.filter((s) => s.slug !== value.slug).map((s) => {
            const on = (v || []).includes(s.slug);
            return (
              <label key={s.slug} className={cn('flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm', on ? 'border-brand bg-brand-50' : 'border-line')}>
                <input type="checkbox" checked={on} onChange={() => set(f.name)(on ? v.filter((x) => x !== s.slug) : [...(v || []), s.slug].slice(0, 10))} /> {s.title}
              </label>
            );
          })}
        </div>
      );
      default: return <input className="input" value={v || ''} onChange={(e) => set(f.name)(e.target.value)} />;
    }
  };

  return (
    <div className="space-y-8">
      {sections.map(([title, fields]) => (
        <fieldset key={title}>
          <legend className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-brand">{title}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <AField key={f.name} label={f.type === 'toggle' ? null : `${f.label}${f.required ? ' *' : ''}`} hint={f.hint} error={errors[f.name]} className={f.full ? 'sm:col-span-2' : ''}>
                {render(f)}
              </AField>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default function ResourceManager({ kind }) {
  const cfg = RESOURCES[kind];
  const { reload: reloadSite } = useSite();
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${kind}?all=1&limit=500`);
      setItems(res.items);
    } catch (e) { toast(e.message, 'error'); } finally { setLoading(false); }
  }, [kind, toast]);
  useEffect(() => { load(); setEditing(null); setQ(''); }, [load]);

  const open = (item) => {
    setErrors({});
    setEditing(item || 'new');
    setDraft(item ? { ...cfg.blank, ...structuredClone(item) } : { ...structuredClone(cfg.blank), order: items.length + 1 });
  };
  const close = () => { setEditing(null); setDraft(null); };

  async function save() {
    setSaving(true);
    setErrors({});
    const body = Object.fromEntries(Object.keys(cfg.blank).concat('slug').map((k) => [k, draft[k]]).filter(([, v]) => v !== undefined));
    for (const k of ['features', 'benefits', 'applications', 'services', 'description']) if (Array.isArray(body[k])) body[k] = body[k].map((s) => s.trim()).filter(Boolean);
    if (Array.isArray(body.gallery)) body.gallery = body.gallery.filter(Boolean);
    if (Array.isArray(body.specifications)) body.specifications = body.specifications.filter((s) => s.label || s.value);
    try {
      if (editing === 'new') await api.post(`/${kind}`, body);
      else await api.put(`/${kind}/${editing._id}`, body);
      toast(`${cfg.singular} saved`);
      close();
      load();
      reloadSite();
    } catch (e) {
      setErrors(e.errors || {});
      toast(e.message, 'error');
    } finally { setSaving(false); }
  }

  async function quickToggle(item, field) {
    try {
      const { _id, createdAt, updatedAt, __v, ...rest } = item;
      await api.put(`/${kind}/${_id}`, { ...rest, [field]: !item[field] });
      load();
      reloadSite();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function remove(item) {
    if (!(await confirm({ title: `Delete ${cfg.singular.toLowerCase()}?`, message: `“${item[cfg.titleField]}” will be permanently removed from the website.` }))) return;
    try {
      await api.del(`/${kind}/${item._id}`);
      toast(`${cfg.singular} deleted`);
      load();
      reloadSite();
    } catch (e) { toast(e.message, 'error'); }
  }

  const filtered = items.filter((i) => !q || JSON.stringify([i[cfg.titleField], i.category, i.excerpt]).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageTitle title={cfg.title} description={cfg.description} actions={<button type="button" className="btn btn-red btn-sm" onClick={() => open(null)}><Plus className="size-4" /> Add {cfg.singular}</button>} />
      <div className="card overflow-hidden">
        <div className="border-b border-line p-4">
          <label className="relative block max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input className="input py-2 pl-9" placeholder={`Search ${cfg.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        {/* Phones: card list */}
        <ul className="divide-y divide-line md:hidden">
          {loading ? <li className="py-10 text-center text-muted">Loading…</li> : filtered.length === 0 ? (
            <li className="px-4 py-12 text-center text-muted">No {cfg.title.toLowerCase()} yet.</li>
          ) : filtered.map((it) => (
            <li key={it._id} className="flex items-center gap-3 px-4 py-3">
              <button type="button" onClick={() => open(it)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <SmartImage src={it[cfg.imageField || 'image']} alt="" icon={it.icon || 'Package'} className="h-14 w-16 shrink-0 rounded-md" imgClassName={cfg.imageField === 'logo' ? 'object-contain bg-white p-1' : undefined} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-navy">{it[cfg.titleField]}</span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', it.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{it.published ? 'Published' : 'Hidden'}</span>
                    {kind === 'services' && it.featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">Homepage</span>}
                  </span>
                </span>
              </button>
              <button type="button" onClick={() => remove(it)} className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:bg-accent-50 hover:text-accent" aria-label={`Delete ${it[cfg.titleField]}`}><Trash2 className="size-5" /></button>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">{cfg.singular}</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? <LoadingRow /> : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-muted">No {cfg.title.toLowerCase()} yet. <button type="button" className="font-semibold text-brand hover:underline" onClick={() => open(null)}>Add the first one</button>.</td></tr>
              ) : filtered.map((it) => (
                <tr key={it._id} className="hover:bg-surface/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SmartImage src={it[cfg.imageField || 'image']} alt="" icon={it.icon || 'Package'} className="h-12 w-16 shrink-0 rounded-md" imgClassName={cfg.imageField === 'logo' ? 'object-contain bg-white p-1' : undefined} />
                      <div className="min-w-0">
                        <button type="button" onClick={() => open(it)} className="flex items-center gap-1.5 py-1 text-left font-semibold text-navy hover:text-brand">
                          {it.icon && <Icon name={it.icon} className="size-4 text-brand" />}{it[cfg.titleField]}
                        </button>
                        <p className="truncate text-xs text-muted">{[it.category || it.industry || (cfg.path ? `/${it.slug}` : ''), typeof it.price === 'number' ? `${it.price.toFixed(3)}` : ''].filter(Boolean).join(' · ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{it.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => quickToggle(it, 'published')} className={cn('inline-flex min-h-7 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', it.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600')} title="Toggle published">
                        {it.published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}{it.published ? 'Published' : 'Hidden'}
                      </button>
                      {'featured' in it && kind === 'services' && (
                        <button type="button" onClick={() => quickToggle(it, 'featured')} className={cn('inline-flex min-h-7 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', it.featured ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500')} title="Toggle homepage">
                          <Star className={cn('size-3', it.featured && 'fill-current')} /> Homepage
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(it.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {cfg.path && <a href={`${cfg.path}${it.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-md p-2 text-muted hover:bg-white hover:text-brand" title="View on website"><ExternalLink className="size-4" /></a>}
                      <button type="button" onClick={() => open(it)} className="rounded-md p-2 text-muted hover:bg-white hover:text-brand" title="Edit"><Pencil className="size-4" /></button>
                      <button type="button" onClick={() => remove(it)} className="rounded-md p-2 text-muted hover:bg-accent-50 hover:text-accent" title="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={!!editing} onClose={close} title={editing === 'new' ? `New ${cfg.singular}` : `Edit ${cfg.singular}`}
        footer={<>
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
          <button type="button" className="btn btn-blue btn-sm" onClick={save} disabled={saving}>{saving && <Spinner />} Save {cfg.singular}</button>
        </>}>
        {draft && <Editor cfg={cfg} value={draft} setValue={setDraft} errors={errors} />}
      </Drawer>
    </>
  );
}
