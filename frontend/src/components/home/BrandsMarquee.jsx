import { useReducedMotion } from 'framer-motion';
import { useSite } from '@/context/SiteContext';
import { useFetch } from '@/lib/useFetch';
import { assetUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import SectionHeading from '../ui/SectionHeading';
import { brands as fallbackBrands } from '@shared/content.js';

function BrandTile({ brand }) {
  const inner = brand.logo ? (
    <img src={assetUrl(brand.logo)} alt={brand.name} loading="lazy" decoding="async" className="max-h-12 w-auto max-w-[150px] object-contain opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
  ) : (
    <span className="whitespace-nowrap font-display text-xl font-bold uppercase tracking-wide text-navy/60 transition-colors group-hover:text-brand">{brand.name}</span>
  );
  const cls = 'group flex h-20 min-w-[170px] items-center justify-center rounded-xl border border-line bg-white px-6 shadow-card transition hover:border-brand/40';
  return brand.website ? (
    <a href={brand.website} target="_blank" rel="noopener noreferrer nofollow" className={cls} aria-label={brand.name}>{inner}</a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Infinite, auto-scrolling brand strip. Pauses on hover; static and swipeable when reduced motion is on. */
export default function BrandsMarquee({ className = 'bg-surface' }) {
  const { settings } = useSite();
  const section = settings.home?.brandsSection || {};
  const { data } = useFetch('/brands', { fallback: { items: fallbackBrands } });
  const reduce = useReducedMotion();
  const brands = data?.items || [];
  if (section.show === false || brands.length === 0) return null;
  const loop = [...brands, ...brands];
  const duration = `${Math.max(20, brands.length * 4)}s`;

  return (
    <section id="brands" className={cn('overflow-hidden py-16 md:py-20', className)} aria-label="Brands we support">
      <div className="container-x">
        <SectionHeading title={section.heading} subtitle={section.subheading} />
      </div>
      {reduce ? (
        <ul className="container-x mt-10 flex gap-4 overflow-x-auto pb-2">
          {brands.map((b) => <li key={b.slug || b.name} className="shrink-0"><BrandTile brand={b} /></li>)}
        </ul>
      ) : (
        <div className="group/marquee relative mt-10 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee gap-4 py-2 group-hover/marquee:[animation-play-state:paused]" style={{ animationDuration: duration }}>
            {loop.map((b, i) => (
              <li key={`${b.slug || b.name}-${i}`} className="shrink-0" aria-hidden={i >= brands.length ? 'true' : undefined}>
                <BrandTile brand={b} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
