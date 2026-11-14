import { useState } from 'react';
import { assetUrl } from '@/lib/api';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * Lazy-loaded image with a branded fallback panel (navy blueprint + icon)
 * when no image is set or the image fails to load.
 */
export default function SmartImage({ src, alt = '', className, imgClassName, icon = 'Settings', priority = false, sizes, ...rest }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = assetUrl(src);
  const showFallback = !url || failed;
  const positioned = /(^|\s)(absolute|fixed)(\s|$)/.test(className || '');

  return (
    <div className={cn(!positioned && 'relative', 'overflow-hidden bg-navy', className)} {...rest}>
      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy to-navy-950" role={alt ? 'img' : undefined} aria-label={alt || undefined}>
          <div className="absolute inset-0 bg-blueprint" />
          <div className="absolute -right-6 -bottom-6 size-40 rounded-full border-[14px] border-white/5" />
          <Icon name={icon} className="relative size-14 text-white/35" strokeWidth={1.25} />
        </div>
      ) : (
        <img
          src={url}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('absolute inset-0 size-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        />
      )}
    </div>
  );
}
