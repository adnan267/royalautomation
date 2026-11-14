import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, MapPin, Send } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import Field from '@/components/ui/Field';
import Reveal from '@/components/ui/Reveal';
import { Alert, Spinner } from '@/components/ui/Feedback';
import ContactMethods from '@/components/sections/ContactMethods';
import { useSite } from '@/context/SiteContext';
import { api } from '@/lib/api';
import { validateContact, focusFirstError } from '@/lib/validation';
import { IMAGES } from '@shared/content.js';

const EMPTY = { name: '', email: '', phone: '', company: '', subject: '', message: '', website: '' };

export default function Contact() {
  const { settings } = useSite();
  const { contact = {} } = settings;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const formRef = useRef(null);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateContact(values);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(formRef.current);
    setStatus({ state: 'sending' });
    try {
      const res = await api.post('/inquiries', values);
      setStatus({ state: 'done', ...res });
      setValues(EMPTY);
    } catch (err) {
      setErrors(err.errors || {});
      setStatus({ state: 'error', message: err.message });
      focusFirstError(formRef.current);
    }
  }

  return (
    <>
      <Seo pageKey="contact" title="Contact Us" />
      <PageHero title="Contact *Us*" subtitle="Questions about a breakdown, an upgrade or a maintenance plan? Our engineering team is ready to help." image={IMAGES.electrical} icon="Headset" crumbs={[{ label: 'Contact' }]} />

      <section className="bg-surface py-16 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[380px_1fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold uppercase text-navy">Get in <span className="text-accent">Touch</span></h2>
            <p className="mt-3 text-muted">Reach us directly or send a message — we’ll get back to you as soon as possible.</p>
            <div className="mt-6"><ContactMethods /></div>
          </Reveal>

          <Reveal className="card p-6 sm:p-8 md:p-10">
            {status.state === 'done' ? (
              <div className="py-10 text-center" role="status">
                <CheckCircle2 className="mx-auto size-16 text-emerald-600" aria-hidden />
                <h2 className="mt-4 font-display text-3xl font-extrabold uppercase text-navy">Message sent</h2>
                <p className="mx-auto mt-3 max-w-md text-lg text-muted">{status.message}</p>
                <p className="mt-2 text-sm text-muted">Reference: <strong className="text-navy">{status.reference}</strong></p>
                <div className="mt-7 flex justify-center gap-3">
                  <button type="button" className="btn btn-outline" onClick={() => setStatus({ state: 'idle' })}>Send another message</button>
                  <Link to="/services" className="btn btn-blue">Explore Services</Link>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <h2 className="font-display text-3xl font-extrabold uppercase text-navy">Send us a message</h2>
                  <p className="mt-1 text-muted">Fields marked <span className="text-accent">*</span> are required. For a detailed quotation use our <Link to="/request-a-quote" className="font-semibold text-brand underline-offset-2 hover:underline">quote form</Link>.</p>
                </div>
                {status.state === 'error' && <Alert className="sm:col-span-2">{status.message}</Alert>}
                <Field label="Full Name" required error={errors.name}><input className="input" autoComplete="name" value={values.name} onChange={set('name')} /></Field>
                <Field label="Email Address" required error={errors.email}><input type="email" className="input" autoComplete="email" value={values.email} onChange={set('email')} /></Field>
                <Field label="Phone Number" error={errors.phone}><input type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} /></Field>
                <Field label="Company" error={errors.company}><input className="input" autoComplete="organization" value={values.company} onChange={set('company')} /></Field>
                <Field label="Subject" error={errors.subject} className="sm:col-span-2"><input className="input" value={values.subject} onChange={set('subject')} /></Field>
                <Field label="Message" required error={errors.message} className="sm:col-span-2"><textarea rows={6} className="input resize-y" value={values.message} onChange={set('message')} /></Field>
                <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label></div>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted">By submitting you agree to our <Link to="/privacy-policy" className="text-brand hover:underline">Privacy Policy</Link>.</p>
                  <button type="submit" className="btn btn-red" disabled={status.state === 'sending'}>
                    {status.state === 'sending' ? <><Spinner /> Sending…</> : <>Send Message <Send className="size-4" /></>}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <section aria-label="Location map">
        {contact.mapEmbedUrl ? (
          <iframe title={`${settings.company?.name} location`} src={contact.mapEmbedUrl} className="block h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        ) : (
          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-navy text-white">
            <div className="absolute inset-0 bg-blueprint" />
            <div className="relative text-center">
              <MapPin className="mx-auto size-10 text-accent" aria-hidden />
              <p className="mt-3 font-display text-2xl font-bold uppercase">On-site support at your facility</p>
              <p className="mt-1 text-white/75">Contact us to arrange a site visit or equipment drop-off.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
