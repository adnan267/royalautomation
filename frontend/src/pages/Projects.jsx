import { Link } from 'react-router';
import { ArrowRight, FolderOpen, MapPin } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, Skeleton } from '@/components/ui/Feedback';
import CtaBanner from '@/components/sections/CtaBanner';
import { useFetch } from '@/lib/useFetch';
import { IMAGES } from '@shared/content.js';

export default function Projects() {
  const { data, loading, error } = useFetch('/projects', { fallback: { items: [] } });
  const items = data?.items || [];
  return (
    <>
      <Seo pageKey="projects" title="Projects & Our Work" />
      <PageHero title="Projects & *Our Work*" subtitle="A look at the automation, repair and maintenance work we deliver for industrial clients." image={IMAGES.whyChoose} icon="Factory" crumbs={[{ label: 'Projects' }]} />
      <section className="bg-surface py-16 md:py-20">
        <div className="container-x">
          {loading ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96" />)}</div>
          ) : items.length ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                  <Link to={`/projects/${p.slug}`} className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                    <SmartImage src={p.image} alt={p.title} icon="Factory" className="aspect-[16/10]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                    <div className="flex flex-1 flex-col p-6">
                      {p.industry && <p className="text-xs font-bold uppercase tracking-widest text-accent">{p.industry}</p>}
                      <h2 className="mt-2 font-display text-2xl font-bold uppercase leading-tight text-navy group-hover:text-brand">{p.title}</h2>
                      {p.location && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin className="size-4" /> {p.location}</p>}
                      <p className="mt-3 flex-1 text-muted">{p.summary}</p>
                      <span className="link-arrow mt-5">View Project <ArrowRight className="size-4" /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title={error ? 'Projects are temporarily unavailable' : 'Project case studies coming soon'}
              text="We’re preparing detailed case studies of our recent automation, repair and maintenance work. In the meantime, tell us about your project and we’ll explain how we would approach it."
            >
              <Link to="/request-a-quote" className="btn btn-blue">Discuss Your Project</Link>
              <Link to="/services" className="btn btn-outline">Explore Services</Link>
            </EmptyState>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
