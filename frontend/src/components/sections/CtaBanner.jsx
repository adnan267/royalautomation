import { ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { SmartLink } from '../ui/Button';
import SmartImage from '../ui/SmartImage';
import Highlight from '../ui/Highlight';
import Reveal from '../ui/Reveal';

export default function CtaBanner({ heading, description, buttonLabel, buttonHref }) {
  const { settings } = useSite();
  const cta = settings.home?.cta || {};
  return (
    <section className="relative isolate overflow-hidden bg-brand text-white">
      <SmartImage src={cta.image} alt="" icon="Factory" className="absolute inset-y-0 left-0 -z-20 w-full opacity-40 mix-blend-luminosity md:w-3/5" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/80 via-brand/90 to-brand" />
      <div className="absolute inset-0 -z-10 bg-blueprint opacity-50" />
      <Reveal className="container-x flex flex-col items-start gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div>
          <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl md:text-[2.6rem]">
            <Highlight text={heading || cta.heading} className="text-white underline decoration-accent decoration-4 underline-offset-8" />
          </h2>
          <p className="mt-3 text-lg text-white/90 md:text-xl">{description || cta.description}</p>
        </div>
        <SmartLink to={buttonHref || cta.buttonHref || '/contact'} className="btn btn-red shrink-0 px-7 py-4 text-lg">
          {buttonLabel || cta.buttonLabel} <ArrowRight className="size-5" aria-hidden />
        </SmartLink>
      </Reveal>
    </section>
  );
}
