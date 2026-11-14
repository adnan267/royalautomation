import { Play, ZoomIn } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import { videoThumb } from '@/lib/video';
import { cn } from '@/lib/utils';

export default function GalleryGrid({ items, onOpen, className }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4', className)}>
      {items.map((it, i) => (
        <li key={it._id || it.slug}>
          <button type="button" onClick={() => onOpen(i)} className="group relative block w-full overflow-hidden rounded-xl bg-navy shadow-card focus-visible:ring-4 focus-visible:ring-brand/40" aria-label={`${it.type === 'video' ? 'Play video' : 'View photo'}${it.title ? `: ${it.title}` : ''}`}>
            <SmartImage src={it.type === 'video' ? videoThumb(it) : it.image} alt={it.title || ''} icon={it.type === 'video' ? 'Activity' : 'Factory'} className="aspect-[4/3]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            {it.type === 'video' ? (
              <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-full bg-accent text-white shadow-lg ring-4 ring-white/30 transition group-hover:scale-110 sm:left-1/2 sm:top-1/2 sm:size-16 sm:-translate-x-1/2 sm:-translate-y-1/2"><Play className="ml-0.5 size-5 fill-current sm:ml-1 sm:size-7" /></span>
            ) : (
              <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-navy opacity-0 transition group-hover:opacity-100"><ZoomIn className="size-4" /></span>
            )}
            {(it.title || it.album) && (
              <span className="absolute inset-x-0 bottom-0 p-3 text-left sm:p-4">
                {it.album && <span className="block text-xs font-bold uppercase tracking-widest text-white/75">{it.album}</span>}
                {it.title && <span className="line-clamp-2 block font-display text-base font-bold uppercase leading-tight text-white sm:text-lg">{it.title}</span>}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
