import { waHref } from './utils';

export const STOCK = {
  in_stock: { label: 'In stock', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  limited: { label: 'Limited stock', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  on_order: { label: 'Available on order', className: 'bg-brand-50 text-brand-700 ring-brand/20' },
  out_of_stock: { label: 'Out of stock', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

export const hasPrice = (p) => typeof p?.price === 'number' && p.price > 0;

/** Formats a price, e.g. 125 → "OMR 125.000" (the Omani rial uses 3 decimals). */
export function formatPrice(value, currency = 'OMR') {
  if (typeof value !== 'number') return '';
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency, currencyDisplay: 'code' }).format(value).replace(/ /g, ' ');
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Builds the WhatsApp order link from the template in Admin → Settings → Website. */
export function whatsappOrderLink(product, qty, settings, pageUrl) {
  const { contact = {}, website = {} } = settings || {};
  if (!contact.whatsapp) return '';
  const currency = website.currency || 'OMR';
  const name = `${product.name}${product.partNumber ? ` (Part no. ${product.partNumber})` : ''}`;
  const price = hasPrice(product) && website.showPrices !== false
    ? `Price: ${formatPrice(product.price, currency)}${product.unit ? ` / ${product.unit}` : ''}`
    : 'Price: please confirm';
  const template = website.whatsappOrderMessage || 'Hello, I would like to order:\n{product}\nQuantity: {qty}\n{price}\n{link}';
  const text = template.replace('{product}', name).replace('{qty}', String(qty)).replace('{price}', price).replace('{link}', pageUrl || '');
  return waHref(contact.whatsapp, text);
}
