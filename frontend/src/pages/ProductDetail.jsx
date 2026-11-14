import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowRight, CheckCircle2, Minus, MessageCircle, Plus, FileText } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { STOCK, formatPrice, hasPrice, whatsappOrderLink } from '@/lib/store';
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
  const [qty, setQty] = useState(1);

  if (!product && loading) return <PageLoader />;
  if (!product || (error?.status === 404 && !local)) return <NotFound />;

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  const related = (all?.items || []).filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  const quoteLink = `/request-a-quote?product=${encodeURIComponent(`${product.name}${qty > 1 ? ` × ${qty}` : ''}`)}`;
  const wa = whatsappOrderLink(product, qty, settings, `${base}/store/${product.slug}`);
  const currency = settings.website?.currency || 'OMR';
  const showPrice = settings.website?.showPrices !== false && hasPrice(product);
  const stock = STOCK[product.stockStatus];
  const unavailable = product.stockStatus === 'out_of_stock';

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
          ...(showPrice ? { offers: { '@type': 'Offer', price: product.price.toFixed(3), priceCurrency: currency, availability: `https://schema.org/${unavailable ? 'OutOfStock' : product.stockStatus === 'on_order' ? 'PreOrder' : 'InStock'}`, url: `${base}/store/${product.slug}` } } : {}),
          url: `${base}/products/${product.slug}`,
        }}
      />
      <PageHero title={product.name} image={product.image} icon="Package" crumbs={[{ label: 'Store', to: '/store' }, ...(product.category ? [{ label: product.category, to: `/store?category=${encodeURIComponent(product.category)}` }] : []), { label: product.name }]} />

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
            <div className="mt-5 rounded-xl border border-line bg-surface p-5">
              {showPrice ? (
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-4xl font-extrabold text-navy">{formatPrice(product.price, currency)}</span>
                  {product.oldPrice > product.price && <span className="text-lg text-muted line-through">{formatPrice(product.oldPrice, currency)}</span>}
                  {product.unit && <span className="text-muted">/ {product.unit}</span>}
                </p>
              ) : (
                <p className="font-display text-3xl font-extrabold uppercase text-navy">Price on request</p>
              )}
              <p className={cn('mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset', stock ? stock.className : 'bg-white text-slate-600 ring-slate-200')}>
                {stock ? stock.label : product.availability || 'Enquire for availability'}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-line bg-white" role="group" aria-label="Quantity">
                  <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} className="grid size-12 place-items-center text-navy hover:text-brand disabled:opacity-40" disabled={qty <= 1} aria-label="Decrease quantity"><Minus className="size-4" /></button>
                  <input type="number" min="1" max="999" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.min(999, Math.max(1, Number(e.target.value) || 1)))} className="h-12 w-14 border-x border-line text-center font-semibold text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" aria-label="Quantity" />
                  <button type="button" onClick={() => setQty((n) => Math.min(999, n + 1))} className="grid size-12 place-items-center text-navy hover:text-brand" aria-label="Increase quantity"><Plus className="size-4" /></button>
                </div>
                {wa && !unavailable ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5b] sm:flex-none"><MessageCircle className="size-5" /> Order on WhatsApp</a>
                ) : (
                  <Link to={quoteLink} className="btn btn-red flex-1 sm:flex-none">{unavailable ? 'Ask for availability' : 'Order / Request Quote'} <ArrowRight className="size-4" /></Link>
                )}
              </div>
              {wa && <p className="mt-3 text-sm text-muted">Your order details open in WhatsApp — our team confirms price, stock and delivery.</p>}
            </div>
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
            <div className="mt-8">
              <Link to={quoteLink} className="btn btn-outline"><FileText className="size-4" /> Request a formal quotation</Link>
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
