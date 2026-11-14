import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useSite } from '@/context/SiteContext';
import { STOCK, formatPrice, hasPrice } from '@/lib/store';

export function ServiceCard({ service, useCardTitle = false, className }) {
  const title = (useCardTitle && service.cardTitle) || service.title;
  return (
    <Link
      to={`/services/${service.slug}`}
      className={cn('group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-lift', className)}
    >
      <div className="relative">
        <SmartImage src={service.image} alt={service.imageAlt || title} icon={service.icon} className="aspect-[16/10]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
        <span className="absolute -bottom-6 left-6 grid size-12 place-items-center rounded-lg bg-brand text-white shadow-lg ring-4 ring-white transition-colors group-hover:bg-accent">
          <Icon name={service.icon} className="size-6" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-10">
        <h3 className="font-display text-[1.45rem] font-bold uppercase leading-tight text-navy transition-colors group-hover:text-brand">{title}</h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{service.excerpt}</p>
        <span className="link-arrow mt-5">Learn More <ArrowRight className="size-4" aria-hidden /></span>
      </div>
      <span className="block h-1 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

export function IndustryCard({ industry }) {
  return (
    <Link
      to={`/industries#${industry.slug}`}
      className="group card relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <SmartImage src={industry.image} alt={industry.imageAlt || industry.title} icon={industry.icon} className="aspect-[4/3]" imgClassName="transition-transform duration-700 group-hover:scale-110" />
      <div className="flex flex-1 items-center justify-center gap-2 border-t-2 border-brand px-3 py-4 text-center">
        <h3 className="font-display text-lg font-bold uppercase leading-tight text-navy group-hover:text-brand">{industry.title}</h3>
      </div>
    </Link>
  );
}

export function ProductCard({ product }) {
  const { settings } = useSite();
  const currency = settings.website?.currency || 'OMR';
  const showPrice = settings.website?.showPrices !== false && hasPrice(product);
  const stock = STOCK[product.stockStatus];
  return (
    <Link to={`/store/${product.slug}`} className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <SmartImage src={product.image} alt={product.imageAlt || product.name} icon="Package" className="aspect-[4/3]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
        {product.category && (
          <span className="absolute left-3 top-3 rounded bg-navy/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">{product.category}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold uppercase leading-tight text-navy group-hover:text-brand">{product.name}</h3>
        {(product.brand || product.partNumber) && (
          <p className="mt-1 text-sm text-muted">{[product.brand, product.partNumber].filter(Boolean).join(' · ')}</p>
        )}
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{product.excerpt}</p>
        <div className="mt-4 border-t border-line pt-4">
          {showPrice ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-2xl font-extrabold text-navy">{formatPrice(product.price, currency)}</span>
              {product.oldPrice > product.price && <span className="text-sm text-muted line-through">{formatPrice(product.oldPrice, currency)}</span>}
              {product.unit && <span className="text-sm text-muted">/ {product.unit}</span>}
            </p>
          ) : (
            <p className="font-display text-lg font-bold uppercase text-navy">Price on request</p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', stock ? stock.className : 'bg-slate-50 text-slate-600 ring-slate-200')}>
              {stock ? stock.label : product.availability || 'Enquire for availability'}
            </span>
            <span className="link-arrow">View <ArrowRight className="size-4" aria-hidden /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}
