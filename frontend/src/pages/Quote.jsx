import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, FileText, Mail, MessageCircle, Paperclip, Phone, Send, UploadCloud, X } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import Field from '@/components/ui/Field';
import Reveal from '@/components/ui/Reveal';
import { Alert, Spinner } from '@/components/ui/Feedback';
import ContactMethods from '@/components/sections/ContactMethods';
import { useSite } from '@/context/SiteContext';
import { api } from '@/lib/api';
import { cn, formatBytes } from '@/lib/utils';
import { validateQuote, focusFirstError } from '@/lib/validation';
import { IMAGES } from '@shared/content.js';

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip';

const CONTACT_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export default function Quote() {
  const { services, industries, settings } = useSite();
  // Limits come from the API (Vercel accepts at most ~4.5 MB per request).
  const MAX_FILES = settings.limits?.maxFiles || 5;
  const MAX_MB = settings.limits?.maxUploadMb || 4;
  const MAX_TOTAL_MB = settings.limits?.maxTotalMb || 4;
  const [params] = useSearchParams();
  const product = params.get('product');
  const initial = {
    fullName: '', companyName: '', email: '', phone: '',
    industry: params.get('industry') || '',
    service: params.get('service') || (product ? 'Products & Spare Parts' : ''),
    equipmentDetails: product ? `Product enquiry: ${product}` : '',
    problemDescription: '', preferredContact: 'email', website: '',
  };
  const [values, setValues] = useState(initial);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const [drag, setDrag] = useState(false);
  const formRef = useRef(null);
  const inputRef = useRef(null);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function addFiles(list) {
    setFileError('');
    const incoming = Array.from(list || []);
    const tooBig = incoming.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (tooBig.length) setFileError(`${tooBig.map((f) => f.name).join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} larger than ${MAX_MB} MB.`);
    const ok = incoming.filter((f) => f.size <= MAX_MB * 1024 * 1024);
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of ok) {
        if (merged.some((p) => p.name === f.name && p.size === f.size)) continue;
        if (merged.length >= MAX_FILES) { setFileError(`You can attach up to ${MAX_FILES} files.`); break; }
        const total = merged.reduce((sum, x) => sum + x.size, 0) + f.size;
        if (total > MAX_TOTAL_MB * 1024 * 1024) { setFileError(`Attachments can total up to ${MAX_TOTAL_MB} MB. For larger files, mention them in the description and our team will arrange another way to receive them.`); break; }
        merged.push(f);
      }
      return merged;
    });
    if (inputRef.current) inputRef.current.value = '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateQuote(values);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(formRef.current);
    setStatus({ state: 'sending' });
    const form = new FormData();
    Object.entries(values).forEach(([k, v]) => form.append(k, v));
    files.forEach((f) => form.append('attachments', f));
    try {
      const res = await api.upload('/quotes', form);
      setStatus({ state: 'done', ...res });
      window.scrollTo({ top: formRef.current?.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
    } catch (err) {
      setErrors(err.errors || {});
      setStatus({ state: 'error', message: err.message });
      focusFirstError(formRef.current);
    }
  }

  const reset = () => { setValues(initial); setFiles([]); setErrors({}); setStatus({ state: 'idle' }); };
  const steps = settings.home?.process?.steps || [];

  return (
    <>
      <Seo pageKey="quote" title="Request a Quote" />
      <PageHero title="Request a *Quote*" subtitle="Tell us about your equipment and the problem. The more detail you share, the faster we can respond with the right solution." image={IMAGES.drives} icon="Gauge" crumbs={[{ label: 'Request a Quote' }]} />

      <section className="bg-surface py-16 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal className="card p-6 sm:p-8 md:p-10">
            {status.state === 'done' ? (
              <div className="py-12 text-center" role="status" aria-live="polite">
                <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50"><CheckCircle2 className="size-12 text-emerald-600" aria-hidden /></span>
                <h2 className="mt-5 font-display text-4xl font-extrabold uppercase text-navy">Request received</h2>
                <p className="mx-auto mt-3 max-w-lg text-lg text-muted">{status.message}</p>
                <p className="mt-4 inline-block rounded-lg bg-surface px-5 py-3 text-navy">Your reference number: <strong className="font-display text-xl tracking-wide">{status.reference}</strong></p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button type="button" className="btn btn-outline" onClick={reset}>Submit another request</button>
                  <Link to="/" className="btn btn-blue">Back to Home</Link>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h2 className="font-display text-3xl font-extrabold uppercase text-navy">Your <span className="text-accent">Requirement</span></h2>
                  <p className="mt-1 text-muted">Fields marked <span className="text-accent">*</span> are required.</p>
                </div>
                {status.state === 'error' && <Alert className="sm:col-span-2">{status.message}</Alert>}

                <fieldset className="contents">
                  <legend className="sr-only">Contact details</legend>
                  <Field label="Full Name" required error={errors.fullName}><input className="input" autoComplete="name" value={values.fullName} onChange={set('fullName')} /></Field>
                  <Field label="Company Name" error={errors.companyName}><input className="input" autoComplete="organization" value={values.companyName} onChange={set('companyName')} /></Field>
                  <Field label="Email Address" required error={errors.email}><input type="email" className="input" autoComplete="email" value={values.email} onChange={set('email')} /></Field>
                  <Field label="Phone Number" required error={errors.phone} hint="Include country code for WhatsApp, e.g. +92…"><input type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} /></Field>
                </fieldset>

                <Field label="Industry" error={errors.industry}>
                  <select className="input" value={values.industry} onChange={set('industry')}>
                    <option value="">Select your industry</option>
                    {industries.map((i) => <option key={i.slug} value={i.title}>{i.title}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Required Service" error={errors.service}>
                  <select className="input" value={values.service} onChange={set('service')}>
                    <option value="">Select a service</option>
                    {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                    <option value="Products & Spare Parts">Products &amp; Spare Parts</option>
                    <option value="Other / Not sure">Other / Not sure</option>
                  </select>
                </Field>

                <Field label="Equipment / Machine Details" error={errors.equipmentDetails} className="sm:col-span-2" hint="Make, model, rating, part number or nameplate details if available.">
                  <textarea rows={3} className="input resize-y" value={values.equipmentDetails} onChange={set('equipmentDetails')} />
                </Field>
                <Field label="Problem Description" required error={errors.problemDescription} className="sm:col-span-2" hint="What happened, any fault codes or alarms, and how urgent it is.">
                  <textarea rows={5} className="input resize-y" value={values.problemDescription} onChange={set('problemDescription')} />
                </Field>

                <fieldset className="sm:col-span-2">
                  <legend className="label">Preferred Contact Method</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {CONTACT_OPTIONS.map(({ value, label, icon: I }) => (
                      <label key={value} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 font-semibold transition', values.preferredContact === value ? 'border-brand bg-brand-50 text-brand-800' : 'border-line text-navy hover:border-brand/50')}>
                        <input type="radio" name="preferredContact" value={value} checked={values.preferredContact === value} onChange={set('preferredContact')} className="sr-only" />
                        <I className="size-5" aria-hidden /> {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="sm:col-span-2">
                  <span className="label">Attachments <span className="font-normal text-muted">(optional)</span></span>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                    className={cn('rounded-xl border-2 border-dashed p-6 text-center transition', drag ? 'border-brand bg-brand-50' : 'border-line bg-surface')}
                  >
                    <UploadCloud className="mx-auto size-9 text-brand" aria-hidden />
                    <p className="mt-2 text-navy"><button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-brand underline-offset-2 hover:underline">Choose files</button> or drag them here</p>
                    <p className="mt-1 text-sm text-muted">Photos, nameplates, drawings or documents — up to {MAX_FILES} files, {MAX_TOTAL_MB} MB in total (PDF, images, Word, Excel, ZIP).</p>
                    <input ref={inputRef} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => addFiles(e.target.files)} aria-label="Attach files" />
                  </div>
                  {(fileError || errors._) && <p className="mt-2 text-sm font-medium text-accent">{fileError || errors._}</p>}
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f) => (
                        <li key={f.name + f.size} className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 text-sm">
                          {f.type.startsWith('image/') ? <Paperclip className="size-4 text-brand" /> : <FileText className="size-4 text-brand" />}
                          <span className="min-w-0 flex-1 truncate text-navy">{f.name}</span>
                          <span className="text-muted">{formatBytes(f.size)}</span>
                          <button type="button" onClick={() => setFiles((p) => p.filter((x) => x !== f))} aria-label={`Remove ${f.name}`} className="rounded p-1 text-muted hover:bg-accent-50 hover:text-accent"><X className="size-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label></div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 sm:col-span-2">
                  <p className="max-w-md text-sm text-muted">Your information is used only to respond to this request. See our <Link to="/privacy-policy" className="text-brand hover:underline">Privacy Policy</Link>.</p>
                  <button type="submit" className="btn btn-red px-7" disabled={status.state === 'sending'}>
                    {status.state === 'sending' ? <><Spinner /> Submitting…</> : <>Submit Request <Send className="size-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          <aside className="space-y-6">
            <div className="rounded-xl bg-navy p-6 text-white shadow-lift">
              <h2 className="font-display text-2xl font-extrabold uppercase">What happens next?</h2>
              <ol className="mt-5 space-y-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-display font-bold">{i + 1}</span>
                    <div><p className="font-semibold">{s.title}</p>{s.text && <p className="text-sm text-white/75">{s.text}</p>}</div>
                  </li>
                ))}
              </ol>
            </div>
            <ContactMethods compact />
          </aside>
        </div>
      </section>
    </>
  );
}
