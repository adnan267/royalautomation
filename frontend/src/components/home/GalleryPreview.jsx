import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { useFetch } from '@/lib/useFetch';
import SectionHeading from '../ui/SectionHeading';
import Lightbox from '../ui/Lightbox';
import GalleryGrid from '../sections/GalleryGrid';

/** Homepage strip of the latest gallery items — hidden until the gallery has content. */
export default function GalleryPreview() {
  const { settings } = useSite();
  const section = settings.home?.gallerySection || {};
  const { data } = useFetch('/gallery?limit=60', { fallback: { items: [] } });
  const [open, setOpen] = useState(null);
  const items = [...(data?.items || [])].sort((a, b) => Number(!!b.featured) - Number(!!a.featured)).slice(0, 8);
  if (section.show === false || items.length === 0) return null;
  return (
    <section className="bg-white py-20 md:py-24" aria-label="Gallery">
      <div className="container-x">
        <SectionHeading title={section.heading} subtitle={section.subheading} />
        <GalleryGrid items={items} onOpen={setOpen} className="mt-12" />
        <div className="mt-10 text-center">
          <Link to="/gallery" className="btn btn-outline">View Full Gallery <ArrowRight className="size-4" /></Link>
        </div>
      </div>
      <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  );
}
