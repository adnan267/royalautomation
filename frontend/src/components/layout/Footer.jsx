import { Link } from 'react-router';
import { Clock, Mail, MapPin, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { SOCIAL } from '@/lib/icons';
import { mailHref, telHref, waHref } from '@/lib/utils';

export default function Footer() {
  const { settings, services } = useSite();
  const { company = {}, contact = {}, social = {}, website = {} } = settings;
  const socials = Object.entries(social).filter(([k, v]) => v && SOCIAL[k]);
  const year = new Date().getFullYear();
  const heading = 'font-display text-lg font-bold uppercase tracking-wide text-white';
  const link = 'inline-flex min-h-6 items-center gap-2 py-0.5 text-white/75 hover:text-white transition-colors';

  const contactRows = [
    contact.phone && { icon: Phone, label: contact.phoneDisplay || contact.phone, href: telHref(contact.phone) },
    contact.email && { icon: Mail, label: contact.email, href: mailHref(contact.email) },
    contact.whatsapp && { icon: MessageCircle, label: 'WhatsApp', href: waHref(contact.whatsapp, contact.whatsappMessage) },
    contact.address && { icon: MapPin, label: contact.address, href: contact.mapLink || '' },
    contact.workingHours && { icon: Clock, label: contact.workingHours },
  ].filter(Boolean);

  return (
    <footer className="relative bg-navy text-white">
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="inline-block rounded-lg bg-white p-3 shadow-lg" aria-label="Home">
            <img src={company.logo || '/brand/logo.jpg'} alt={company.name} width="641" height="278" loading="lazy" className="h-16 w-auto" />
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-white/75">{company.shortIntro}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2.5" aria-label="Social media">
              {socials.map(([k, url]) => {
                const S = SOCIAL[k];
                return (
                  <li key={k}>
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={S.label} className="grid size-10 place-items-center rounded-md bg-white/10 text-lg text-white transition-colors hover:bg-accent">
                      <S.icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className={heading}>Quick Links</h2>
          <ul className="mt-5 space-y-3">
            {[['Home', '/'], ['About Us', '/about'], ['Industries', '/industries'], ['Products', '/products'], ['Projects', '/projects'], ['Contact', '/contact'], ['Request a Quote', '/request-a-quote']].map(([l, to]) => (
              <li key={to}><Link to={to} className={link}>{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className={heading}>Our Services</h2>
          <ul className="mt-5 space-y-3">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}><Link to={`/services/${s.slug}`} className={link}>{s.title}</Link></li>
            ))}
            <li><Link to="/services" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-accent">All services <ArrowRight className="size-4" /></Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className={heading}>Contact</h2>
          <ul className="mt-5 space-y-3.5">
            {contactRows.map(({ icon: I, label, href }) => (
              <li key={label} className="flex gap-3">
                <I className="mt-0.5 size-[18px] shrink-0 text-accent" aria-hidden />
                {href ? (
                  <a href={href} className="text-white/80 hover:text-white" {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{label}</a>
                ) : (
                  <span className="text-white/80">{label}</span>
                )}
              </li>
            ))}
            {contactRows.length < 2 && (
              <>
                <li className="flex gap-3"><Phone className="mt-0.5 size-[18px] text-accent" aria-hidden /><Link to="/contact" className="text-white/80 hover:text-white">Call Our Team</Link></li>
                <li className="flex gap-3"><Mail className="mt-0.5 size-[18px] text-accent" aria-hidden /><Link to="/contact" className="text-white/80 hover:text-white">Email Us</Link></li>
              </>
            )}
            <li className="flex gap-3"><MapPin className="mt-0.5 size-[18px] text-accent" aria-hidden /><Link to="/contact" className="text-white/80 hover:text-white">Get in Touch</Link></li>
          </ul>
          <Link to="/request-a-quote" className="btn btn-red btn-sm mt-7">Request a Quote <ArrowRight className="size-4" /></Link>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-white/65 md:flex-row md:items-center md:justify-between">
          <p>© {year} {company.name}. All rights reserved.{website.footerNote ? ` ${website.footerNote}` : ''}</p>
          <ul className="flex gap-5">
            <li><Link to="/privacy-policy" className="-my-2 inline-block py-2 hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="-my-2 inline-block py-2 hover:text-white">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="h-2 bg-accent" />
    </footer>
  );
}
