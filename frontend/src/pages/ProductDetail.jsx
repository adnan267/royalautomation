import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, CheckCircle2, MessageCircle, Package } from 'lucide-react';
import Seo from '@/components/Seo';
import JsonLd from '@/components/JsonLd';
import { useSiteUrl } from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { PageLoader } from '@/components/ui/Feedback';
import { ProductCard } from '@/components/sections/Cards';
import { useFetch } from '@/lib/useFetch';
import { useSite } from '@/context/SiteContext';
import { cn, waHref } from '@/lib/utils';
import { assetUrl } from '@/lib/api';
import { products as fallbackProducts } from '@shared/content.js';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const base = useSiteUrl();
  const local = fallbackProducts.find((p) => p.slug === slug);
  const { data: product, loading, error } = useFetch(`/products/${slug}`, { fallback: local, deps: [slug] });
  const { data: all } = useFetch('/products', { fallback: { items: fallbackProducts } });
  const [active, setActive] = useState(0);

  if (!product && loading) return <PageLoader />;
  if (!product || (error?.status === 404 && !local)) return <NotFound />;

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  const related = (all?.items || []).filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  const quoteLink = `/request-a-quote?product=${encodeURIComponent(product.name)}`;
  const wa = waHref(settings.contact?.whatsapp, `Hello, I'd like to enquire about: ${product.name}${product.partNumber ? ` (${product.partNumber})` : ''}`);

  return (
    <>
      <Seo title={product.seoTitle || product.name} description={product.seoDescription || product.excerpt} image={product.image} type="product" />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.excerpt || product.description,
          category: product.category,
          ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
          ...(product.partNumber ? { mpn: product.partNumber } : {}),
          ...(images[0] ? { image: images.map((i) => assetUrl(i)) } : {}),
          url: `${base}/products/${product.slug}`,
        }}
      />
      <PageHero title={product.name} image={product.image} icon="Package" crumbs={[{ label: 'Products', to: '/products' }, ...(product.category ? [{ label: product.category, to: `/products?category=${encodeURIComponent(product.category)}` }] : []), { label: product.name }]} />

      <section className="py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SmartImage src={images[active]} alt={product.imageAlt || product.name} icon="Package" className="aspect-[4/3] rounded-2xl border border-line shadow-card" />
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} className={cn('overflow-hidden rounded-lg border-2', i === active ? 'border-brand' : 'border-transparent')}>
                    <SmartImage src={src} alt="" className="aspect-square" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>
          <Reveal>
            {product.category && <p className="eyebrow">{product.category}</p>}
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase text-navy md:text-5xl">{product.name}</h2>
            {(product.brand || product.partNumber) && (
              <p className="mt-2 text-muted">{product.brand && <>Brand: <strong className="text-navy">{product.brand}</strong></>}{product.brand && product.partNumber && ' · '}{product.partNumber && <>Part no: <strong className="text-navy">{product.partNumber}</strong></>}</p>
            )}
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"><Package className="size-4" /> {product.availability || 'Enquire for availability'}</p>
            <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>

            {product.features?.length > 0 && (
              <>
                <h3 className="mt-8 font-display text-xl font-bold uppercase text-navy">Highlights</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {product.features.map((f) => <li key={f} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden /> {f}</li>)}
                </ul>
              </>
            )}
            {product.applications?.length > 0 && (
              <>
                <h3 className="mt-8 font-display text-xl font-bold uppercase text-navy">Typical Applications</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.applications.map((a) => <li key={a} className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-navy">{a}</li>)}
                </ul>
              </>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={quoteLink} className="btn btn-red">Request a Quote <ArrowRight className="size-4" /></Link>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><MessageCircle className="size-4" /> WhatsApp Enquiry</a>}
            </div>
          </Reveal>
        </div>

        {product.specifications?.length > 0 && (
          <div className="container-x mt-16">
            <h2 className="font-display text-3xl font-extrabold uppercase text-navy">Specifications</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left">
                <tbody>
                  {product.specifications.map((s, i) => (
                    <tr key={s.label} className={i % 2 ? 'bg-white' : 'bg-surface'}>
                      <th scope="row" className="w-1/3 px-5 py-3 font-semibold text-navy">{s.label}</th>
                      <td className="px-5 py-3 text-ink">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="bg-surface py-20">
          <div className="container-x">
            <SectionHeading title="Related *Products*" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
