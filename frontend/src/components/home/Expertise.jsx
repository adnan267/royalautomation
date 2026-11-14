import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { useSite } from '@/context/SiteContext';
import SmartImage from '../ui/SmartImage';
import Highlight from '../ui/Highlight';
import Reveal from '../ui/Reveal';

function GearMark(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="6" aria-hidden="true" {...props}>
      <circle cx="100" cy="100" r="38" />
      <path d="M100 18v24M100 158v24M18 100h24M158 100h24M42 42l17 17M141 141l17 17M42 158l17-17M141 59l17-17" strokeLinecap="round" />
      <circle cx="100" cy="100" r="62" />
    </svg>
  );
}

export default function Expertise() {
  const { settings } = useSite();
  const ex = settings.home?.expertise || {};
  return (
    <section className="relative overflow-hidden bg-surface" aria-labelledby="expertise-heading">
      <div className="grid lg:grid-cols-2">
        <Reveal className="relative min-h-[320px] lg:min-h-[560px]">
          <SmartImage src={ex.image} alt={ex.imageAlt} icon="Microchip" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-surface/10" />
          <div className="absolute bottom-0 left-0 h-2 w-1/2 bg-accent" />
        </Reveal>
        <div className="relative flex items-center">
          <GearMark className="pointer-events-none absolute -right-16 -top-10 size-72 text-brand/[0.06]" />
          <GearMark className="pointer-events-none absolute -bottom-20 right-24 size-56 text-brand/[0.05]" />
          <Reveal className="relative w-full px-6 py-16 sm:px-10 lg:max-w-[640px] lg:px-14 xl:px-20">
            <p className="eyebrow">Engineering Expertise</p>
            <h2 id="expertise-heading" className="mt-3 font-display text-4xl font-extrabold uppercase text-navy md:text-5xl">
              <Highlight text={ex.heading} />
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{ex.description}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {(ex.features || []).map((f) => (
                <li key={f} className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3.5 font-semibold text-navy shadow-card">
                  <CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-blue mt-9">Discuss Your Requirement <ArrowRight className="size-4" aria-hidden /></Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
