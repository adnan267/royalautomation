import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PackageSearch, Search } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, Skeleton } from '@/components/ui/Feedback';
import { ProductCard } from '@/components/sections/Cards';
import CtaBanner from '@/components/sections/CtaBanner';
import { useFetch } from '@/lib/useFetch';
import { cn } from '@/lib/utils';
import { products as fallbackProducts, productCategories, IMAGES } from '@shared/content.js';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const [q, setQ] = useState('');
  const { data, loading } = useFetch('/products', { fallback: { items: fallbackProducts } });
  const items = data?.items || [];

  const categories = useMemo(() => {
    const set = new Set([...productCategories, ...items.map((p) => p.category).filter(Boolean)]);
    return [...set].filter((c) => items.some((p) => p.category === c));
  }, [items]);

  const filtered = items.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || [p.name, p.category, p.brand, p.partNumber, p.excerpt].join(' ').toLowerCase().includes(q.toLowerCase())),
  );

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  return (
    <>
      <Seo pageKey="products" title={category ? `${category} — Products & Spare Parts` : 'Products & Spare Parts'} />
      <PageHero
        title="Products & *Spare Parts*"
        subtitle="Automation components and spare parts to keep your equipment running. Share a part number or nameplate and we’ll confirm availability."
        image={IMAGES.panel}
        icon="Package"
        crumbs={[{ label: 'Products', to: category ? '/products' : undefined }, ...(category ? [{ label: category }] : [])]}
      />
      <section className="bg-surface py-14 md:py-20">
        <div className="container-x">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {['', ...categories].map((c) => (
                <button
                  key={c || 'all'}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={cn('rounded-full border px-4 py-2 text-sm font-semibold transition', category === c ? 'border-brand bg-brand text-white' : 'border-line bg-white text-navy hover:border-brand hover:text-brand')}
                >
                  {c || 'All Products'}
                </button>
              ))}
            </div>
            <label className="relative w-full lg:w-80">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, brand or part no." className="input pl-10" />
            </label>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && !items.length
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-96" />)
              : filtered.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 0.05}><ProductCard product={p} /></Reveal>
                ))}
          </div>
          {!loading && filtered.length === 0 && (
            <EmptyState icon={PackageSearch} title="No matching products" text="Can’t find the part you need? Send us the part number or a photo of the nameplate and we’ll help you source it." className="mt-6">
              <Link to="/request-a-quote" className="btn btn-blue">Request a Part</Link>
              <button type="button" className="btn btn-outline" onClick={() => { setQ(''); setCategory(''); }}>Clear filters</button>
            </EmptyState>
          )}
        </div>
      </section>
      <CtaBanner heading="Looking for a specific part?" description="Send us the part number, model or a nameplate photo." buttonLabel="Request a Part" buttonHref="/request-a-quote" />
    </>
  );
}
