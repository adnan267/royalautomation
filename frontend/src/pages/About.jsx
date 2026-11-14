import { ArrowRight, Eye, Target } from 'lucide-react';
import { Link } from 'react-router';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Highlight from '@/components/ui/Highlight';
import ProcessSteps from '@/components/sections/ProcessSteps';
import CtaBanner from '@/components/sections/CtaBanner';
import { useSite } from '@/context/SiteContext';
import { Icon } from '@/lib/icons';
import { IMAGES } from '@shared/content.js';

export default function About() {
  const { settings, services } = useSite();
  const company = settings.company || {};
  const about = company.about || {};
  return (
    <>
      <Seo pageKey="about" title="About Us" />
      <PageHero
        title="About *Us*"
        subtitle={`${company.name} — ${company.tagline}.`}
        image={IMAGES.about}
        crumbs={[{ label: 'About Us' }]}
      />

      <section className="py-20 md:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <SmartImage src={settings.home?.expertise?.image || IMAGES.expertise} alt="Engineer working on industrial electronics" icon="Microchip" className="aspect-[4/3] rounded-2xl shadow-lift" />
            <div className="absolute -bottom-6 -right-4 hidden rounded-xl bg-navy p-6 text-white shadow-lift sm:block">
              <p className="font-display text-2xl font-extrabold uppercase leading-none">{company.tagline}</p>
            </div>
            <div className="absolute -left-4 -top-4 -z-10 size-40 rounded-2xl bg-dots" />
          </Reveal>
          <Reveal>
            <p className="eyebrow">Who We Are</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase text-navy md:text-5xl"><Highlight text={about.heading} /></h2>
            <div className="prose-ra mt-6">{(about.paragraphs || []).map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/services" className="btn btn-blue">Our Services <ArrowRight className="size-4" /></Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { icon: Target, title: 'Our Mission', text: about.mission },
            { icon: Eye, title: 'Our Vision', text: about.vision },
          ].filter((x) => x.text).map(({ icon: I, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="card relative overflow-hidden p-8 md:p-10">
              <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-brand to-accent" />
              <I className="size-10 text-brand" strokeWidth={1.5} aria-hidden />
              <h2 className="mt-4 font-display text-3xl font-extrabold uppercase text-navy">{title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {(about.values || []).length > 0 && (
        <section className="py-20 md:py-24">
          <div className="container-x">
            <SectionHeading title="Our *Values*" subtitle="The principles behind every job we take on." />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.06} className="card p-7 text-center transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand"><Icon name={v.icon} className="size-8" strokeWidth={1.6} /></span>
                  <h3 className="mt-5 font-display text-xl font-bold uppercase text-navy">{v.title}</h3>
                  <p className="mt-2 text-muted">{v.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProcessSteps className="bg-surface" />

      <section className="py-20">
        <div className="container-x">
          <SectionHeading title="What We *Do*" />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className="group flex items-center gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-brand hover:shadow-card">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-white group-hover:bg-accent"><Icon name={s.icon} className="size-5" /></span>
                  <span className="font-semibold text-navy group-hover:text-brand">{s.title}</span>
                  <ArrowRight className="ml-auto size-4 text-brand opacity-0 transition group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
