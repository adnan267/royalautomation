import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useSite } from '@/context/SiteContext';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { ServiceCard } from '../sections/Cards';

export default function CoreServices() {
  const { settings, services } = useSite();
  const section = settings.home?.servicesSection || {};
  const featured = services.filter((s) => s.featured);
  const list = (featured.length ? featured : services).slice(0, 6);
  return (
    <section className="bg-surface py-20 md:py-24" aria-label="Our core services">
      <div className="container-x">
        <SectionHeading title={section.heading} subtitle={section.subheading} />
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.08}>
              <ServiceCard service={s} useCardTitle />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/services" className="btn btn-outline">View All Services <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
