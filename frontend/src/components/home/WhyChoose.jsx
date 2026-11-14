import { useSite } from '@/context/SiteContext';
import { Icon } from '@/lib/icons';
import SmartImage from '../ui/SmartImage';
import Highlight from '../ui/Highlight';
import Reveal from '../ui/Reveal';

export default function WhyChoose() {
  const { settings } = useSite();
  const why = settings.home?.whyChoose || {};
  return (
    <section className="relative isolate overflow-hidden bg-white" aria-labelledby="why-heading">
      <SmartImage src={why.image} alt="" icon="Factory" className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[55%]" />
      <div className="absolute inset-0 -z-10 bg-white/90 lg:bg-gradient-to-r lg:from-white lg:from-[45%] lg:via-white/80 lg:to-white/20" />
      <div className="container-x py-20 md:py-24">
        <div>
          <Reveal>
            <p className="eyebrow">Why Work With Us</p>
            <h2 id="why-heading" className="mt-3 font-display text-4xl font-extrabold uppercase text-navy md:text-5xl">
              <Highlight text={why.heading} />
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(why.items || []).map((it, i) => (
              <Reveal as="li" key={it.title} delay={i * 0.06} className="group rounded-xl border border-line bg-white/95 p-5 text-center shadow-card backdrop-blur transition sm:text-left lg:text-center hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift">
                <span className="mx-auto grid size-14 place-items-center rounded-full sm:mx-0 lg:mx-auto border-2 border-brand/20 bg-brand-50 text-brand transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                  <Icon name={it.icon} className="size-7" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold uppercase leading-tight text-navy">{it.title}</h3>
                {it.text && <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
