import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { MessageCircle, PackageSearch, Search, SlidersHorizontal } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import { EmptyState, Skeleton } from '@/components/ui/Feedback';
import { ProductCard } from '@/components/sections/Cards';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import CtaBanner from '@/components/sections/CtaBanner';
import { useSite } from '@/context/SiteContext';
import { useFetch } from '@/lib/useFetch';
import { hasPrice } from '@/lib/store';
import { cn, waHref } from '@/lib/utils';
import { products as fallbackProducts, productCategories, IMAGES } from '@shared/content.js';

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => Number(!!b.featured) - Number(!!a.featured) || (a.order ?? 0) - (b.order ?? 0) },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => (hasPrice(a) ? a.price : Infinity) - (hasPrice(b) ? b.price : Infinity) },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => (hasPrice(b) ? b.price : -1) - (hasPrice(a) ? a.price : -1) },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function Products() {
  const { settings } = useSite();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'featured';
  const [q, setQ] = useState(params.get('q') || '');
  const [inStock, setInStock] = useState(false);
  const { data, loading } = useFetch('/products', { fallback: { items: fallbackProducts } });
  const items = data?.items || [];

  const categories = useMemo(() => {
    const set = new Set([...productCategories, ...items.map((p) => p.category).filter(Boolean)]);
    return [...set].filter((c) => items.some((p) => p.category === c));
  }, [items]);

  const filtered = items
    .filter((p) =>
      (!category || p.category === category)
      && (!inStock || ['in_stock', 'limited'].includes(p.stockStatus))
      && (!q || [p.name, p.category, p.brand, p.partNumber, p.excerpt].join(' ').toLowerCase().includes(q.toLowerCase())))
    .sort(SORTS[sort].fn);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const wa = waHref(settings.contact?.whatsapp, 'Hello The Royal Automation, I am looking for a part:');

  return (
    <>
      <Seo pageKey="products" title={category ? `${category} — Store` : 'Store — Products & Spare Parts'} />
      <PageHero
        title="Our *Store*"
        subtitle="Automation components and spare parts. Browse the catalogue and order directly on WhatsApp — or send us a part number and we’ll source it."
        image={IMAGES.panel}
        icon="Package"
        crumbs={[{ label: 'Store', to: category ? '/store' : undefined }, ...(category ? [{ label: category }] : [])]}
      >
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-red"><MessageCircle className="size-5" /> Ask on WhatsApp</a>}
      </PageHero>

      <section className="bg-surface py-12 md:py-16">
        <div className="container-x">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filter by category">
            {['', ...categories].map((c) => (
              <button
                key={c || 'all'}
                type="button"
                onClick={() => setParam('category', c)}
                aria-pressed={category === c}
                className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', category === c ? 'border-brand bg-brand text-white' : 'border-line bg-white text-navy hover:border-brand hover:text-brand')}
              >
                {c || 'All Products'}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <label className="relative">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, brand or part number" className="input pl-10" />
            </label>
            <label className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted" aria-hidden />
              <span className="sr-only">Sort by</span>
              <select className="input py-2.5" value={sort} onChange={(e) => setParam('sort', e.target.value === 'featured' ? '' : e.target.value)}>
                {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-navy">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="size-4 accent-brand" /> In stock only
            </label>
          </div>
          <p className="mt-4 text-sm text-muted" aria-live="polite">{loading && !items.length ? 'Loading products…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}</p>

          <div className="mt-4 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading && !items.length
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-96" />)
              : filtered.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 4) * 0.05}><ProductCard product={p} /></Reveal>
                ))}
          </div>
          {!loading && filtered.length === 0 && (
            <EmptyState icon={PackageSearch} title="No matching products" text="Can’t find the part you need? Send us the part number or a photo of the nameplate and we’ll help you source it." className="mt-6">
              <Link to="/request-a-quote?service=Products%20%26%20Spare%20Parts" className="btn btn-blue">Request a Part</Link>
              <button type="button" className="btn btn-outline" onClick={() => { setQ(''); setInStock(false); setParams({}, { replace: true }); }}>Clear filters</button>
            </EmptyState>
          )}
        </div>
      </section>
      <BrandsMarquee className="bg-white" />
      <CtaBanner heading="Looking for a specific part?" description="Send us the part number, model or a nameplate photo." buttonLabel="Request a Part" buttonHref="/request-a-quote?service=Products%20%26%20Spare%20Parts" />
    </>
  );
}
