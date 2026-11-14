import { Link } from 'react-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import CtaBanner from '@/components/sections/CtaBanner';
import { useSite } from '@/context/SiteContext';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { IMAGES } from '@shared/content.js';

export default function Industries() {
  const { industries } = useSite();
  return (
    <>
      <Seo pageKey="industries" title="Industries We Serve" />
      <PageHero
        title="Industries *We Serve*"
        subtitle="Practical automation, electrical and maintenance support for demanding industrial environments."
        image={IMAGES.manufacturing}
        icon="Factory"
        crumbs={[{ label: 'Industries' }]}
      />

      <nav aria-label="Industries" className="sticky top-[70px] z-30 border-b border-line bg-white/95 backdrop-blur">
        <ul className="container-x flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
          {industries.map((i) => (
            <li key={i.slug} className="shrink-0">
              <a href={`#${i.slug}`} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy transition hover:border-brand hover:bg-brand hover:text-white">
                <Icon name={i.icon} className="size-4" /> {i.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="py-12 md:py-16">
        {industries.map((ind, idx) => (
          <section key={ind.slug} id={ind.slug} className="scroll-mt-40 py-10 md:py-14" aria-labelledby={`${ind.slug}-h`}>
            <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn('relative', idx % 2 === 1 && 'lg:order-2')}>
                <SmartImage src={ind.image} alt={ind.imageAlt || ind.title} icon={ind.icon} className="aspect-[16/11] rounded-2xl shadow-lift" />
                <span className="absolute -bottom-5 left-6 grid size-16 place-items-center rounded-xl bg-accent text-white shadow-lift ring-4 ring-white">
                  <Icon name={ind.icon} className="size-8" strokeWidth={1.6} />
                </span>
              </Reveal>
              <Reveal>
                <p className="eyebrow">Industry {String(idx + 1).padStart(2, '0')}</p>
                <h2 id={`${ind.slug}-h`} className="mt-3 font-display text-4xl font-extrabold uppercase text-navy">{ind.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{ind.description || ind.excerpt}</p>
                {ind.applications?.length > 0 && (
                  <>
                    <h3 className="mt-7 font-display text-lg font-bold uppercase tracking-wide text-navy">Typical support areas</h3>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {ind.applications.map((a) => (
                        <li key={a} className="flex items-center gap-2.5 text-ink"><CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden /> {a}</li>
                      ))}
                    </ul>
                  </>
                )}
                <Link to={`/request-a-quote?industry=${encodeURIComponent(ind.title)}`} className="btn btn-blue mt-8">Discuss Your Facility <ArrowRight className="size-4" /></Link>
              </Reveal>
            </div>
          </section>
        ))}
      </div>
      <CtaBanner />
    </>
  );
}
