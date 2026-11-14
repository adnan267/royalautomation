import { Link } from 'react-router';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { mailHref, telHref, waHref } from '@/lib/utils';
import { SOCIAL } from '@/lib/icons';

/** Contact cards built from Admin → Settings → Contact. Unconfigured channels point to the contact form. */
export default function ContactMethods({ compact = false }) {
  const { settings } = useSite();
  const { contact = {}, social = {} } = settings;
  const rows = [
    { icon: Phone, title: 'Call Our Team', value: contact.phoneDisplay || contact.phone, href: telHref(contact.phone), cta: 'Tap to call' },
    { icon: Mail, title: 'Email Us', value: contact.email, href: mailHref(contact.email, 'Service enquiry'), cta: 'Send an email' },
    { icon: MessageCircle, title: 'WhatsApp', value: contact.whatsapp ? 'Chat with our team' : '', href: waHref(contact.whatsapp, contact.whatsappMessage), cta: 'Start a chat' },
    { icon: MapPin, title: 'Visit / Location', value: contact.address, href: contact.mapLink, cta: 'Open in maps' },
    { icon: Clock, title: 'Working Hours', value: contact.workingHours },
  ].filter((r) => r.value);
  const socials = Object.entries(social).filter(([k, v]) => v && SOCIAL[k]);

  return (
    <div className="space-y-4">
      {rows.map(({ icon: I, title, value, href, cta }) => {
        const inner = (
          <>
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand text-white transition-colors group-hover:bg-accent"><I className="size-5" aria-hidden /></span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-bold uppercase text-navy">{title}</span>
              <span className="block break-words text-ink">{value}</span>
              {href && !compact && <span className="mt-0.5 block text-sm font-semibold text-brand">{cta}</span>}
            </span>
          </>
        );
        return href ? (
          <a key={title} href={href} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="group card flex items-start gap-4 p-4 transition hover:border-brand hover:shadow-lift">{inner}</a>
        ) : (
          <div key={title} className="group card flex items-start gap-4 p-4">{inner}</div>
        );
      })}
      {rows.length === 0 && (
        <div className="card p-6">
          <p className="font-display text-lg font-bold uppercase text-navy">Talk to our engineers</p>
          <p className="mt-2 text-muted">Send us your details using the form and our team will contact you by your preferred method.</p>
          <Link to="/request-a-quote" className="btn btn-blue btn-sm mt-4">Request a Quote</Link>
        </div>
      )}
      {socials.length > 0 && (
        <div className="card p-4">
          <p className="font-display font-bold uppercase text-navy">Follow us</p>
          <ul className="mt-3 flex gap-2">
            {socials.map(([k, url]) => {
              const S = SOCIAL[k];
              return <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" aria-label={S.label} className="grid size-10 place-items-center rounded-md bg-surface text-lg text-navy transition hover:bg-brand hover:text-white"><S.icon /></a></li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
