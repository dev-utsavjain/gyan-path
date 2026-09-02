import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, ImageIcon } from 'lucide-react';
import { fetchGallery, type GalleryItem, type GalleryType } from '../api/gallery';
import { MediaThumb, MediaLightbox, useLightbox } from '../components/GalleryMedia';

const FILTERS: { id: 'all' | GalleryType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Photos' },
  { id: 'video', label: 'Videos' },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | GalleryType>('all');
  const { open, setOpen } = useLightbox();

  useEffect(() => {
    let alive = true;
    fetchGallery()
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const shown = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const counts = {
    image: items.filter((i) => i.type === 'image').length,
    video: items.filter((i) => i.type === 'video').length,
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>Gallery | GyaanPath Digital - Photos &amp; Videos</title>
        <meta
          name="description"
          content="Photos and videos from GyaanPath Digital — classes, events, and student moments from our skill development programs."
        />
      </Helmet>

      {/* Header */}
      <section className="bg-blue-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Gallery</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Moments from our classes, events, and the students building new careers with us.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Only worth showing filters when both kinds exist */}
        {counts.image > 0 && counts.video > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  filter === f.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <Loader2 size={28} className="animate-spin mx-auto" />
          </div>
        ) : shown.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <ImageIcon size={40} className="mx-auto mb-3" />
            <p className="font-medium">Nothing here yet.</p>
            <p className="text-sm">Photos and videos will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shown.map((item) => (
              // Keyed wrapper: this project has no @types/react, so `key` on a
              // custom component isn't recognised by tsc.
              <div key={item.id}>
                <MediaThumb item={item} onOpen={() => setOpen(item)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {open && <MediaLightbox item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
