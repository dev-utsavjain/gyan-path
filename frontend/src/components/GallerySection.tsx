import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGallery, type GalleryItem } from '../api/gallery';
import { MediaThumb, MediaLightbox, useLightbox } from './GalleryMedia';

// Homepage strip. Prefers the items an admin marked "featured"; falls back to
// the most recent media so the section is never empty just because nothing was
// flagged.
export default function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const { open, setOpen } = useLightbox();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetchGallery({ featured: true, limit: 12 })
      .then((featured) => (featured.length > 0 ? featured : fetchGallery({ limit: 12 })))
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch(() => {
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Nothing uploaded yet — don't render an empty band on the homepage.
  if (items.length === 0) return null;

  const nudge = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">Gallery</h2>
            <p className="text-gray-600 mt-1">Moments from our classes, events, and students.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Arrows are a convenience on desktop; the strip is swipeable anyway. */}
            <button
              onClick={() => nudge(-1)}
              aria-label="Scroll left"
              className="hidden sm:flex w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 items-center justify-center hover:border-orange-300 hover:text-orange-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Scroll right"
              className="hidden sm:flex w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 items-center justify-center hover:border-orange-300 hover:text-orange-500 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors cursor-target"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[31%]">
              <MediaThumb item={item} onOpen={() => setOpen(item)} />
            </div>
          ))}
        </div>

        <div className="mt-4 sm:hidden">
          <Link to="/gallery" className="inline-flex items-center gap-1.5 text-orange-600 font-semibold text-sm">
            View full gallery <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {open && <MediaLightbox item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
