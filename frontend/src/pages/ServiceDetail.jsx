import { Link, useParams } from 'react-router';
import { ArrowRight, Check, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import Seo from '@/components/Seo';
import JsonLd from '@/components/JsonLd';
import { useSiteUrl } from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { PageLoader } from '@/components/ui/Feedback';
import { ServiceCard } from '@/components/sections/Cards';
import CtaBanner from '@/components/sections/CtaBanner';
import { useSite } from '@/context/SiteContext';
import { useFetch } from '@/lib/useFetch';
import { Icon } from '@/lib/icons';
import { cn, telHref, waHref } from '@/lib/utils';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { services, settings } = useSite();
  const local = services.find((s) => s.slug === slug);
  const { data, loading, error } = useFetch(`/services/${slug}`, { fallback: local, deps: [slug] });
  const base = useSiteUrl();
  const service = data || local;

  if (!service && loading) return <PageLoader />;
  if (!service || (error?.status === 404 && !local)) return <NotFound />;

  const related = (service.related || []).map((r) => services.find((s) => s.slug === r)).filter(Boolean);
  const relatedList = related.length ? related : services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const { contact = {} } = settings;
  const quoteLink = `/request-a-quote?service=${encodeURIComponent(service.title)}`;

  return (
    <>
      <Seo title={service.seoTitle || service.title} description={service.seoDescription || service.excerpt} image={service.image} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.excerpt,
          serviceType: service.title,
          url: `${base}/services/${service.slug}`,
          provider: { '@id': `${base}/#organization`, name: settings.company?.name },
          ...(service.image ? { image: service.image } : {}),
        }}
      />
      <PageHero title={service.title} subtitle={service.excerpt} image={service.image} imageAlt={service.imageAlt} icon={service.icon} crumbs={[{ label: 'Services', to: '/services' }, { label: service.title }]}>
        <Link to={quoteLink} className="btn btn-red">Request This Service <ArrowRight className="size-4" /></Link>
        <a href="#overview" className="btn btn-outline-light">Learn More</a>
      </PageHero>

      <section id="overview" className="py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
          <article>
            <Reveal>
              <p className="eyebrow">Service Overview</p>
              <p className="mt-4 text-xl font-medium leading-relaxed text-navy md:text-2xl">{service.intro}</p>
            </Reveal>
            <Reveal className="mt-10 grid gap-8 md:grid-cols-[1fr_280px] md:items-start">
              <div className="prose-ra">{(service.description || []).map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
              <SmartImage src={service.image} alt={service.imageAlt || service.title} icon={service.icon} className="aspect-[4/5] rounded-xl shadow-lift" />
            </Reveal>

            {service.features?.length > 0 && (
              <Reveal className="mt-14">
                <h2 className="font-display text-3xl font-extrabold uppercase text-navy">Key <span className="text-accent">Features</span></h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex gap-3 rounded-lg border border-line bg-surface p-4">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                      <span className="font-medium text-navy">{f}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {service.benefits?.length > 0 && (
              <Reveal className="mt-14 overflow-hidden rounded-2xl bg-navy p-8 text-white md:p-10">
                <h2 className="font-display text-3xl font-extrabold uppercase">Benefits <span className="text-[#ff5a64]">For You</span></h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent"><Check className="size-4" aria-hidden /></span>
                      <span className="text-white/90">{b}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="All services" className="card overflow-hidden">
              <h2 className="bg-navy px-5 py-4 font-display text-lg font-bold uppercase tracking-wide text-white">All Services</h2>
              <ul className="divide-y divide-line">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`} aria-current={s.slug === service.slug ? 'page' : undefined} className={cn('flex items-center gap-3 px-5 py-3 text-[15px] transition-colors', s.slug === service.slug ? 'bg-brand text-white' : 'text-navy hover:bg-surface hover:text-brand')}>
                      <Icon name={s.icon} className="size-4 shrink-0" /> {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand to-navy p-6 text-white shadow-lift">
              <div className="absolute inset-0 bg-blueprint opacity-50" />
              <div className="relative">
                <h2 className="font-display text-2xl font-extrabold uppercase">Need this service?</h2>
                <p className="mt-2 text-white/85">Tell us about your equipment and the problem — we’ll respond with next steps.</p>
                <Link to={quoteLink} className="btn btn-red mt-5 w-full">Request a Service</Link>
                {contact.phone && <a href={telHref(contact.phone)} className="btn btn-outline-light mt-3 w-full"><Phone className="size-4" /> Call Our Team</a>}
                {contact.whatsapp && <a href={waHref(contact.whatsapp, `Hello, I'd like to ask about ${service.title}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light mt-3 w-full"><MessageCircle className="size-4" /> WhatsApp</a>}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="container-x">
          <SectionHeading title="Related *Services*" />
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {relatedList.map((s) => <ServiceCard key={s.slug} service={s} />)}
          </div>
        </div>
      </section>
      <CtaBanner heading="Ready to get started?" description="Request a service and our engineers will review your requirement." buttonLabel="Request a Service" buttonHref={quoteLink} />
    </>
  );
}
