import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import SmartImage from './SmartImage';
import Highlight from './Highlight';
import JsonLd from '../JsonLd';
import { useSiteUrl } from '../Seo';

/** Inner-page banner with breadcrumbs (and BreadcrumbList structured data). */
export default function PageHero({ title, subtitle, image, imageAlt = '', icon, crumbs = [], children }) {
  const siteUrl = useSiteUrl();
  const all = [{ label: 'Home', to: '/' }, ...crumbs];
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <SmartImage src={image} alt={imageAlt} icon={icon} priority className="absolute inset-0 -z-20 opacity-100" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/55" />
      <div className="absolute inset-0 -z-10 bg-blueprint opacity-60" />
      <div className="container-x py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/75">
            {all.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3.5 text-white/40" aria-hidden />}
                {c.to && i < all.length - 1 ? (
                  <Link to={c.to} className="-my-2 inline-block py-2 hover:text-white">{c.label}</Link>
                ) : (
                  <span aria-current="page" className="text-white">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold uppercase sm:text-5xl md:text-6xl">
          <Highlight text={title} className="text-[#ff5a64]" />
        </h1>
        <span className="mt-5 block h-1 w-24 rounded bg-accent" />
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/85 md:text-xl">{subtitle}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label.replace(/\*/g, ''),
            ...(c.to ? { item: `${siteUrl}${c.to}` } : {}),
          })),
        }}
      />
    </section>
  );
}
