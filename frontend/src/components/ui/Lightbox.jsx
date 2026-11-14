import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { assetUrl } from '@/lib/api';
import { parseVideo } from '@/lib/video';

/** Full-screen viewer for gallery photos and videos (keyboard, swipe, prev/next). */
export default function Lightbox({ items, index, onClose, onIndex }) {
  const item = index != null ? items[index] : null;
  const touch = useRef(null);
  const go = (d) => onIndex((index + d + items.length) % items.length);

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  });

  const video = item?.type === 'video' ? parseVideo(item.videoUrl) : null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-[#020d22] text-white"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          role="dialog" aria-modal="true" aria-label={item.title || 'Gallery item'}
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50 && items.length > 1) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="text-sm text-white/70">{index + 1} / {items.length}</p>
            <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close"><X className="size-6" /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
            {items.length > 1 && (
              <button type="button" onClick={() => go(-1)} className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/25 sm:left-4" aria-label="Previous"><ChevronLeft className="size-7" /></button>
            )}
            <motion.div key={item._id || item.slug} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex size-full items-center justify-center">
              {item.type === 'image' ? (
                <img src={assetUrl(item.image)} alt={item.title || item.caption || 'Gallery photo'} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
              ) : video?.provider === 'file' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={video.src} poster={assetUrl(item.image) || undefined} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg bg-black shadow-2xl" />
              ) : video ? (
                <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-lg bg-black shadow-2xl">
                  <iframe src={video.embed} title={item.title || 'Video'} className="size-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                </div>
              ) : (
                <p className="text-white/70">This video link could not be played.</p>
              )}
            </motion.div>
            {items.length > 1 && (
              <button type="button" onClick={() => go(1)} className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/25 sm:right-4" aria-label="Next"><ChevronRight className="size-7" /></button>
            )}
          </div>
          {(item.title || item.caption) && (
            <div className="px-4 py-4 text-center sm:px-6">
              {item.title && <p className="font-display text-xl font-bold uppercase">{item.title}</p>}
              {item.caption && <p className="mx-auto mt-1 max-w-2xl text-sm text-white/75">{item.caption}</p>}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
