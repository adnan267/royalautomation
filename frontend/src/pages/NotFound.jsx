import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Seo from '@/components/Seo';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-surface py-28">
      <Seo title="Page Not Found" noindex />
      <div className="absolute inset-0 bg-dots opacity-60" aria-hidden />
      <div className="container-x relative text-center">
        <p className="font-display text-[8rem] font-extrabold leading-none text-brand/15 md:text-[11rem]">404</p>
        <h1 className="-mt-6 font-display text-4xl font-extrabold uppercase text-navy md:text-5xl">Page <span className="text-accent">not found</span></h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">The page you’re looking for may have moved. Let’s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-blue">Back to Home</Link>
          <Link to="/services" className="btn btn-outline">Our Services <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
