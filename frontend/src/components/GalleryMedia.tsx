import { useState } from 'react';
import { Play, X } from 'lucide-react';
import type { GalleryItem } from '../api/gallery';

// Frame every item shares, so mixed photo/video content lines up in a grid or
// a scroll strip regardless of the source aspect ratio.
export function MediaThumb({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const poster = item.type === 'video' ? item.thumbnail_url : item.url;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-target"
    >
      {poster ? (
        <img
          src={poster}
          alt={item.caption || 'Gallery media'}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // A pasted video link with no poster supplied — show the frame, let the
        // play badge carry the meaning.
        <div className="w-full h-full bg-blue-900/90" />
      )}

      {item.type === 'video' && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-orange-500 transition-colors">
            <Play size={24} className="ml-0.5" fill="currentColor" />
          </span>
        </span>
      )}

      {item.caption && (
        <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent text-white text-xs sm:text-sm font-medium px-3 pt-6 pb-2 text-left line-clamp-2">
          {item.caption}
        </span>
      )}
    </button>
  );
}

// Full-size viewer. Videos play inline with native controls; images just get
// room to breathe.
export function MediaLightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X size={22} />
      </button>

      <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video
            src={item.url}
            poster={item.thumbnail_url || undefined}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[80vh] rounded-xl bg-black"
          />
        ) : (
          <img src={item.url} alt={item.caption || 'Gallery media'} className="w-full max-h-[80vh] object-contain rounded-xl" />
        )}
        {item.caption && <p className="text-white/90 text-sm mt-3 text-center">{item.caption}</p>}
      </div>
    </div>
  );
}

// Shared open/close state for a set of media — used by both the Gallery page
// and the homepage strip.
export function useLightbox() {
  const [open, setOpen] = useState<GalleryItem | null>(null);
  return { open, setOpen };
}
