import { Link, useParams } from 'react-router';
import { ArrowLeft, Building2, CalendarDays, MapPin, Factory } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { PageLoader } from '@/components/ui/Feedback';
import CtaBanner from '@/components/sections/CtaBanner';
import { useFetch } from '@/lib/useFetch';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: p, loading, error } = useFetch(`/projects/${slug}`, { deps: [slug] });
  if (loading) return <PageLoader />;
  if (error || !p) return <NotFound />;
  const facts = [
    [Building2, 'Client', p.client],
    [Factory, 'Industry', p.industry],
    [MapPin, 'Location', p.location],
    [CalendarDays, 'Completed', p.completedOn],
  ].filter(([, , v]) => v);
  const blocks = [['The Challenge', p.challenge], ['Our Solution', p.solution], ['The Outcome', p.outcome]].filter(([, v]) => v);

  return (
    <>
      <Seo title={p.title} description={p.summary} image={p.image} type="article" />
      <PageHero title={p.title} subtitle={p.summary} image={p.image} icon="Factory" crumbs={[{ label: 'Projects', to: '/projects' }, { label: p.title }]} />
      <section className="py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_340px]">
          <article className="space-y-10">
            {p.image && <SmartImage src={p.image} alt={p.title} className="aspect-[16/9] rounded-2xl shadow-lift" />}
            {blocks.map(([h, text]) => (
              <Reveal key={h}>
                <h2 className="font-display text-3xl font-extrabold uppercase text-navy">{h}</h2>
                <div className="prose-ra mt-4">{text.split(/\n{2,}/).map((para) => <p key={para.slice(0, 30)}>{para}</p>)}</div>
              </Reveal>
            ))}
            {p.gallery?.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">{p.gallery.map((g) => <SmartImage key={g} src={g} alt={p.title} className="aspect-[4/3] rounded-xl" />)}</div>
            )}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {facts.length > 0 && (
              <dl className="card divide-y divide-line">
                {facts.map(([I, k, v]) => (
                  <div key={k} className="flex gap-3 p-5"><I className="mt-0.5 size-5 text-brand" aria-hidden /><div><dt className="text-sm text-muted">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div></div>
                ))}
              </dl>
            )}
            {p.services?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-display text-lg font-bold uppercase text-navy">Services Delivered</h2>
                <ul className="mt-3 flex flex-wrap gap-2">{p.services.map((s) => <li key={s} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800">{s}</li>)}</ul>
              </div>
            )}
            <Link to="/projects" className="inline-flex items-center gap-2 font-semibold text-brand"><ArrowLeft className="size-4" /> All projects</Link>
          </aside>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
