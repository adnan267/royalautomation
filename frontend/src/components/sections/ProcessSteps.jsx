import { ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';

export default function ProcessSteps({ className = 'bg-white' }) {
  const { settings } = useSite();
  const process = settings.home?.process || {};
  const steps = process.steps || [];
  if (!steps.length) return null;
  return (
    <section className={`${className} py-20 md:py-24`} aria-labelledby="process-heading">
      <div className="container-x">
        <SectionHeading title={process.heading} />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative flex lg:pr-10">
              <div className="flex-1 rounded-2xl border border-line bg-gradient-to-br from-white to-surface p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand font-display text-2xl font-extrabold text-white shadow-[0_0_0_6px_#eaf3fb]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl font-bold uppercase leading-tight text-navy">{s.title}</h3>
                </div>
                {s.text && <p className="mt-4 leading-relaxed text-muted">{s.text}</p>}
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-1.5 top-1/2 hidden size-7 -translate-y-1/2 text-brand lg:block" aria-hidden />
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
