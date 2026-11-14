import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSite } from '@/context/SiteContext';
import { SmartLink } from '../ui/Button';
import SmartImage from '../ui/SmartImage';
import { Icon } from '@/lib/icons';

export default function Hero() {
  const { settings } = useSite();
  const hero = settings.home?.hero || {};
  const highlights = settings.home?.highlights || [];
  const reduce = useReducedMotion();
  const fade = (d = 0) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] } });

  return (
    <section className="relative isolate overflow-hidden bg-navy text-white" aria-labelledby="hero-heading">
      {/* Photo sits on the right; navy panel with diagonal edge on the left keeps text readable. */}
      <SmartImage
        src={hero.image}
        alt={hero.imageAlt}
        icon="Cpu"
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 lg:left-[34%]"
        imgClassName="object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/92 to-navy/40 lg:hidden" />
      <div
        className="absolute inset-y-0 left-0 -z-10 hidden w-[62%] bg-gradient-to-r from-navy-950 via-navy to-navy/95 lg:block"
        style={{ clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)' }}
      />
      <div className="absolute inset-y-0 left-[44%] -z-10 hidden w-[24%] bg-gradient-to-r from-navy/70 to-transparent lg:block" />
      <div className="absolute inset-0 -z-10 bg-blueprint opacity-40 lg:w-[58%]" />

      <div className="container-x flex min-h-[520px] items-center py-20 md:min-h-[580px] lg:min-h-[600px]">
        <div className="max-w-[880px]">
          <motion.h1 id="hero-heading" {...fade(0.05)} className="font-display text-[2.6rem] font-extrabold uppercase leading-[0.98] sm:text-6xl lg:text-[4.1rem] xl:text-[4.5rem]">
            <span className="block">{hero.headingLine1}</span>
            <span className="block text-[#e3313d]">{hero.headingLine2}</span>
          </motion.h1>
          <motion.span {...fade(0.15)} className="mt-6 block h-1 w-40 rounded bg-gradient-to-r from-accent to-accent/0" />
          <motion.p {...fade(0.22)} className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
            {hero.description}
          </motion.p>
          <motion.div {...fade(0.3)} className="mt-9 flex flex-wrap gap-4">
            {hero.primaryCta?.label && (
              <SmartLink to={hero.primaryCta.href || '/request-a-quote'} className="btn btn-red">
                {hero.primaryCta.label} <ArrowRight className="size-5" aria-hidden />
              </SmartLink>
            )}
            {hero.secondaryCta?.label && (
              <SmartLink to={hero.secondaryCta.href || '/services'} className="btn btn-outline-light">
                {hero.secondaryCta.label} <ArrowRight className="size-5" aria-hidden />
              </SmartLink>
            )}
          </motion.div>
        </div>
      </div>

      {/* D. Service highlights bar */}
      {highlights.length > 0 && (
        <div className="relative border-t border-white/10 bg-gradient-to-r from-navy-900/95 via-brand-800/95 to-navy-900/95 backdrop-blur">
          <ul className="container-x grid grid-cols-2 md:grid-cols-4">
            {highlights.map((h, i) => (
              <li
                key={h.title}
                className={`flex items-center justify-center gap-3 px-2 py-5 text-center md:py-6 ${i > 0 ? 'md:border-l md:border-white/20' : ''} ${i % 2 === 1 ? 'border-l border-white/20 md:border-l' : ''} ${i > 1 ? 'border-t border-white/15 md:border-t-0' : ''}`}
              >
                <Icon name={h.icon} className="size-7 shrink-0 text-white" strokeWidth={1.75} />
                <span className="font-display text-base font-bold uppercase tracking-wide sm:text-lg">{h.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
