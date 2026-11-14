import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Camera, Images, PlayCircle } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHero from '@/components/ui/PageHero';
import { EmptyState, Skeleton } from '@/components/ui/Feedback';
import Lightbox from '@/components/ui/Lightbox';
import GalleryGrid from '@/components/sections/GalleryGrid';
import CtaBanner from '@/components/sections/CtaBanner';
import { useFetch } from '@/lib/useFetch';
import { cn } from '@/lib/utils';
import { IMAGES } from '@shared/content.js';

const TABS = [
  { id: '', label: 'All', icon: Images },
  { id: 'image', label: 'Photos', icon: Camera },
  { id: 'video', label: 'Videos', icon: PlayCircle },
];

export default function Gallery() {
  const { data, loading } = useFetch('/gallery?limit=500', { fallback: { items: [] } });
  const items = data?.items || [];
  const [type, setType] = useState('');
  const [album, setAlbum] = useState('');
  const [open, setOpen] = useState(null);

  const albums = useMemo(() => [...new Set(items.map((i) => i.album).filter(Boolean))], [items]);
  const filtered = items.filter((i) => (!type || i.type === type) && (!album || i.album === album));
  const counts = { '': items.length, image: items.filter((i) => i.type === 'image').length, video: items.filter((i) => i.type === 'video').length };

  return (
    <>
      <Seo pageKey="gallery" title="Gallery — Photos & Videos" />
      <PageHero title="Our *Gallery*" subtitle="Photos and videos from our workshop, site visits and completed jobs." image={IMAGES.expertise} icon="Factory" crumbs={[{ label: 'Gallery' }]} />
      <section className="bg-surface py-12 md:py-16">
        <div className="container-x">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
          ) : items.length === 0 ? (
            <EmptyState icon={Images} title="Gallery coming soon" text="We’re adding photos and videos of our recent automation, repair and maintenance work. Check back soon.">
              <Link to="/services" className="btn btn-blue">Explore Our Services</Link>
            </EmptyState>
          ) : (
            <>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex w-full rounded-xl border border-line bg-white p-1 md:w-auto" role="tablist" aria-label="Media type">
                  {TABS.map(({ id, label, icon: I }) => (
                    <button key={id || 'all'} type="button" role="tab" aria-selected={type === id} onClick={() => setType(id)}
                      className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition md:flex-none', type === id ? 'bg-navy text-white' : 'text-navy hover:bg-surface')}>
                      <I className="size-4" aria-hidden /> {label} <span className="opacity-60">{counts[id]}</span>
                    </button>
                  ))}
                </div>
                {albums.length > 0 && (
                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Albums">
                    {['', ...albums].map((a) => (
                      <button key={a || 'all'} type="button" aria-pressed={album === a} onClick={() => setAlbum(a)}
                        className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition', album === a ? 'border-brand bg-brand text-white' : 'border-line bg-white text-navy hover:border-brand')}>
                        {a || 'All albums'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {filtered.length ? (
                <GalleryGrid items={filtered} onOpen={setOpen} className="mt-8" />
              ) : (
                <EmptyState icon={Images} title="Nothing here yet" text="No items match this filter." className="mt-8" />
              )}
            </>
          )}
        </div>
      </section>
      <Lightbox items={filtered} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
      <CtaBanner />
    </>
  );
}
