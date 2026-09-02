import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Loader2, RefreshCw, Trash2, Save, AlertCircle, UploadCloud, Link2, Star, Eye, EyeOff, Play, Info, X,
} from 'lucide-react';
import {
  fetchAllGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadMedia,
  validateFile,
  ACCEPT_ATTR,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  MAX_IMAGE_MB,
  MAX_VIDEO_MB,
  RECOMMENDED_IMAGE,
  RECOMMENDED_VIDEO,
  type GalleryItem,
  type GalleryType,
} from '../../api/gallery';
import { ApiError } from '../../api/client';

const input =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

interface TabProps {
  onAuthError: () => void;
  showToast: (m: string) => void;
}

// The rules an admin needs before picking a file — kept visible next to the
// picker rather than buried in a tooltip.
function UploadRules() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
      <div className="flex items-start gap-2 mb-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <strong>Upload guidelines</strong>
      </div>
      <ul className="space-y-1 ml-6 list-disc text-[13px]">
        <li>
          <strong>Photos:</strong> {IMAGE_FORMATS.join(', ').toUpperCase()} — max <strong>{MAX_IMAGE_MB} MB</strong> per
          photo. Recommended: {RECOMMENDED_IMAGE}.
        </li>
        <li>
          <strong>Videos:</strong> {VIDEO_FORMATS.join(', ').toUpperCase()} — max <strong>{MAX_VIDEO_MB} MB</strong> per
          video. Recommended: {RECOMMENDED_VIDEO}.
        </li>
        <li>Gallery cards use a 16:9 frame — other shapes are centre-cropped, so keep faces near the middle.</li>
        <li>Large files upload slowly on mobile data — compress before uploading where you can.</li>
      </ul>
    </div>
  );
}

export default function GalleryTab({ onAuthError, showToast }: TabProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Add panel: either upload a file or paste a link.
  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [caption, setCaption] = useState('');
  const [featured, setFeatured] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkType, setLinkType] = useState<GalleryType>('image');
  const [linkThumb, setLinkThumb] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAllGallery());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load gallery');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const resetAddForm = () => {
    setCaption('');
    setFeatured(false);
    setLinkUrl('');
    setLinkThumb('');
    setLinkType('image');
    setProgress(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    // Validate everything before uploading anything, so a bad file in the
    // middle doesn't leave a half-done batch.
    for (const file of Array.from(files)) {
      const reason = validateFile(file);
      if (reason) {
        setError(`${file.name}: ${reason}`);
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
    }

    setSaving(true);
    let done = 0;
    try {
      for (const file of Array.from(files)) {
        const media = await uploadMedia(file, setProgress);
        await createGalleryItem({
          type: media.type,
          url: media.url,
          thumbnail_url: media.thumbnail_url,
          public_id: media.public_id,
          // A caption typed once applies to a single file; batches stay blank
          // and can be captioned afterwards.
          caption: files.length === 1 ? caption.trim() : '',
          featured,
          status: 'active',
          sort_order: 0,
        });
        done += 1;
        setProgress(null);
      }
      showToast(`${done} file${done === 1 ? '' : 's'} added to the gallery`);
      resetAddForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const addLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createGalleryItem({
        type: linkType,
        url: linkUrl.trim(),
        thumbnail_url: linkThumb.trim(),
        caption: caption.trim(),
        featured,
        status: 'active',
        sort_order: 0,
      });
      showToast('Media added to the gallery');
      resetAddForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add media');
    } finally {
      setSaving(false);
    }
  };

  // Small in-place edits (caption, featured, visibility, order) reuse the
  // update endpoint with the row's existing media fields.
  const patch = async (item: GalleryItem, changes: Partial<GalleryItem>, toast?: string) => {
    setBusyId(item.id);
    const next = { ...item, ...changes };
    try {
      await updateGalleryItem(item.id, {
        type: next.type,
        url: next.url,
        thumbnail_url: next.thumbnail_url,
        caption: next.caption,
        public_id: next.public_id,
        featured: next.featured,
        status: next.status,
        sort_order: next.sort_order,
      });
      setItems((list) => list.map((x) => (x.id === item.id ? next : x)));
      if (toast) showToast(toast);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update media');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: GalleryItem) => {
    if (!window.confirm('Delete this media permanently? This cannot be undone.')) return;
    setBusyId(item.id);
    try {
      await deleteGalleryItem(item.id);
      setItems((list) => list.filter((x) => x.id !== item.id));
      showToast('Media deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete media');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {items.length} item{items.length === 1 ? '' : 's'} · {items.filter((i) => i.featured).length} featured on the
          homepage
        </p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setMode('upload')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              mode === 'upload' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            <UploadCloud size={16} /> Upload files
          </button>
          <button
            onClick={() => setMode('link')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              mode === 'link' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            <Link2 size={16} /> Paste a link
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            {mode === 'upload' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Choose photos or videos</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    multiple
                    disabled={saving}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white file:font-semibold hover:file:bg-orange-600 file:cursor-pointer border border-gray-300 rounded-lg p-1.5 disabled:opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can select several files at once.</p>
                </div>

                {saving && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Loader2 size={14} className="animate-spin" />
                      {progress === null ? 'Saving…' : `Uploading… ${progress}%`}
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${progress ?? 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={addLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media link *</label>
                  <input
                    className={input}
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://…"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A direct link to an image or video file. It must start with https://
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className={input} value={linkType} onChange={(e) => setLinkType(e.target.value as GalleryType)}>
                      <option value="image">Photo</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  {linkType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Poster image link</label>
                      <input className={input} value={linkThumb} onChange={(e) => setLinkThumb(e.target.value)} placeholder="Optional" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Add to gallery
                </button>
              </form>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
              <input className={input} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Spoken English batch, June 2026" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              Show in the homepage gallery strip
            </label>
          </div>

          <UploadRules />
        </div>
      </div>

      {/* Existing media */}
      {loading && items.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 size={24} className="animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
          Nothing in the gallery yet. Upload a photo or video above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                item.status === 'hidden' ? 'border-gray-100 opacity-70' : 'border-gray-100'
              }`}
            >
              <div className="relative aspect-video bg-gray-100">
                {(item.type === 'video' ? item.thumbnail_url : item.url) ? (
                  <img
                    src={item.type === 'video' ? item.thumbnail_url : item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-900/80" />
                )}
                {item.type === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-11 h-11 rounded-full bg-black/55 flex items-center justify-center text-white">
                      <Play size={20} className="ml-0.5" fill="currentColor" />
                    </span>
                  </span>
                )}
                <span className="absolute top-2 left-2 flex gap-1.5">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/90 text-gray-700 border border-gray-200">
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </span>
                  {item.featured && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-500 text-white">
                      Homepage
                    </span>
                  )}
                  {item.status === 'hidden' && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-700 text-white">
                      Hidden
                    </span>
                  )}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  defaultValue={item.caption}
                  placeholder="Add a caption…"
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value !== item.caption) patch(item, { caption: value }, 'Caption saved');
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => patch(item, { featured: !item.featured }, item.featured ? 'Removed from homepage' : 'Added to homepage')}
                    disabled={busyId === item.id}
                    title={item.featured ? 'Remove from the homepage strip' : 'Show in the homepage strip'}
                    className={`flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                      item.featured
                        ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <Star size={14} fill={item.featured ? 'currentColor' : 'none'} /> Homepage
                  </button>
                  <button
                    onClick={() =>
                      patch(
                        item,
                        { status: item.status === 'active' ? 'hidden' : 'active' },
                        item.status === 'active' ? 'Hidden from the site' : 'Visible on the site',
                      )
                    }
                    disabled={busyId === item.id}
                    title={item.status === 'active' ? 'Hide from the public gallery' : 'Show in the public gallery'}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {item.status === 'active' ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => remove(item)}
                    disabled={busyId === item.id}
                    title="Delete permanently"
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    {busyId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
