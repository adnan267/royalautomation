import { useSite } from '@/context/SiteContext';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { IndustryCard } from '../sections/Cards';

export default function IndustriesGrid() {
  const { settings, industries } = useSite();
  const section = settings.home?.industriesSection || {};
  return (
    <section className="bg-white py-20 md:py-24" aria-label="Industries we support">
      <div className="container-x">
        <SectionHeading title={section.heading} subtitle={section.subheading} />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
          {industries.slice(0, 6).map((ind, i) => (
            <Reveal key={ind.slug} delay={i * 0.05}>
              <IndustryCard industry={ind} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
