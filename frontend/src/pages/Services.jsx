import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { ServiceCard } from '@/components/sections/Cards';
import ProcessSteps from '@/components/sections/ProcessSteps';
import CtaBanner from '@/components/sections/CtaBanner';
import { useSite } from '@/context/SiteContext';
import { IMAGES } from '@shared/content.js';

export default function Services() {
  const { services, settings } = useSite();
  return (
    <>
      <Seo pageKey="services" title="Industrial Automation & Repair Services" />
      <PageHero
        title="Our *Services*"
        subtitle="Industrial automation, electrical engineering, equipment repair and maintenance — delivered by engineers who understand production."
        image={settings.home?.hero?.image || IMAGES.hero}
        icon="Cpu"
        crumbs={[{ label: 'Services' }]}
      >
        <a href="#all-services" className="btn btn-outline-light">Browse Services</a>
      </PageHero>
      <section id="all-services" className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <SectionHeading title="What We *Offer*" subtitle="Select a service to see what’s included, how it helps and how to request it." />
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 0.06}><ServiceCard service={s} /></Reveal>
            ))}
          </div>
        </div>
      </section>
      <ProcessSteps />
      <CtaBanner />
    </>
  );
}
