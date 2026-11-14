import { useLocation } from 'react-router';
import { useSite } from '@/context/SiteContext';
import { assetUrl } from '@/lib/api';
import { plain } from '@/lib/utils';

export function useSiteUrl() {
  const { settings } = useSite();
  return (settings?.seo?.siteUrl || import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
}

const absolute = (url, base) => {
  const u = assetUrl(url);
  if (!u) return '';
  return /^https?:/.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`;
};

/**
 * Per-page <title>, meta description, canonical and Open Graph / Twitter tags.
 * React 19 hoists these elements into <head>. `pageKey` pulls admin-managed
 * overrides from Settings → SEO.
 */
export default function Seo({ pageKey, title, description, image, type = 'website', noindex = false }) {
  const { settings } = useSite();
  const { pathname } = useLocation();
  const base = useSiteUrl();
  const seo = settings?.seo || {};
  const override = (pageKey && seo.pages?.[pageKey]) || {};

  const pageTitle = plain(override.title || title || '');
  const fullTitle = pageTitle
    ? (seo.titleTemplate || '%s | The Royal Automation').replace('%s', pageTitle)
    : seo.defaultTitle || 'The Royal Automation';
  const desc = plain(override.description || description || seo.defaultDescription || '').slice(0, 300);
  const canonical = `${base}${pathname === '/' ? '' : pathname}`;
  const ogImage = absolute(image || seo.ogImage, base);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical" href={canonical || '/'} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}
