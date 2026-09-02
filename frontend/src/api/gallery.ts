import { apiFetch, getAdminToken } from './client';
import BASE from '../lib/api';

export type GalleryType = 'image' | 'video';
export type GalleryStatus = 'active' | 'hidden';

export interface GalleryItem {
  id: number;
  type: GalleryType;
  url: string;
  thumbnail_url: string;
  caption: string;
  public_id?: string;
  featured: boolean;
  status: GalleryStatus;
  sort_order: number;
  created_at: string;
}

export type GalleryInput = Omit<GalleryItem, 'id' | 'created_at'>;

interface ListResponse {
  items: GalleryItem[];
}

// ── Upload rules, shown to the admin verbatim in the upload panel ────────────
export const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const VIDEO_FORMATS = ['mp4', 'mov', 'webm', 'm4v'];
export const MAX_IMAGE_MB = 10;
export const MAX_VIDEO_MB = 100;
// Gallery cards render in a 16:9 frame; anything else is centre-cropped to fit.
export const RECOMMENDED_IMAGE = '1600 × 900 px (16:9), landscape';
export const RECOMMENDED_VIDEO = '1920 × 1080 px (16:9), under 2 minutes';

export const ACCEPT_ATTR = [
  ...IMAGE_FORMATS.map((f) => `.${f}`),
  ...VIDEO_FORMATS.map((f) => `.${f}`),
].join(',');

export function typeForFile(file: File): GalleryType | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_FORMATS.includes(ext)) return 'image';
  if (VIDEO_FORMATS.includes(ext)) return 'video';
  return null;
}

// Returns an admin-readable reason the file can't be used, or null if it's fine.
export function validateFile(file: File): string | null {
  const kind = typeForFile(file);
  if (!kind) {
    return `Unsupported file type. Use ${IMAGE_FORMATS.join(', ').toUpperCase()} for photos or ${VIDEO_FORMATS.join(', ').toUpperCase()} for videos.`;
  }
  const limitMb = kind === 'video' ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > limitMb) {
    return `This ${kind} is ${sizeMb.toFixed(1)} MB — the limit is ${limitMb} MB. Please compress it and try again.`;
  }
  return null;
}

// ── Reads ────────────────────────────────────────────────────────────────────

// Public gallery. `featured` limits it to the homepage strip's picks.
export function fetchGallery(opts: { featured?: boolean; limit?: number } = {}): Promise<GalleryItem[]> {
  const params = new URLSearchParams();
  if (opts.featured) params.set('featured', 'true');
  if (opts.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return apiFetch<ListResponse>(`/gallery${qs ? `?${qs}` : ''}`).then((r) => r.items || []);
}

export function fetchAllGallery(): Promise<GalleryItem[]> {
  return apiFetch<ListResponse>('/admin/gallery', { auth: true }).then((r) => r.items || []);
}

// ── Writes ───────────────────────────────────────────────────────────────────

export function createGalleryItem(data: GalleryInput): Promise<{ item: GalleryItem }> {
  return apiFetch<{ item: GalleryItem }>('/admin/gallery', { method: 'POST', body: data, auth: true });
}

export function updateGalleryItem(id: number, data: GalleryInput): Promise<{ item: GalleryItem }> {
  return apiFetch<{ item: GalleryItem }>(`/admin/gallery/${id}`, { method: 'PUT', body: data, auth: true });
}

export function deleteGalleryItem(id: number): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(`/admin/gallery/${id}`, { method: 'DELETE', auth: true });
}

// ── Upload ───────────────────────────────────────────────────────────────────

interface UploadSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  signature: string;
  folder: string;
}

export interface UploadedMedia {
  type: GalleryType;
  url: string;
  thumbnail_url: string;
  public_id: string;
}

// Cloudinary serves a poster frame for a video by swapping the extension, so a
// video needs no separately uploaded thumbnail.
function videoPoster(secureUrl: string): string {
  return secureUrl.replace(/\.[a-z0-9]+$/i, '.jpg');
}

// Uploads one file straight to object storage. The backend only signs the
// request — the bytes go browser → Cloudinary, never through our server, which
// is what makes 100 MB videos workable.
export async function uploadMedia(file: File, onProgress?: (percent: number) => void): Promise<UploadedMedia> {
  const reason = validateFile(file);
  if (reason) throw new Error(reason);

  const kind = typeForFile(file) as GalleryType;

  // apiFetch is JSON-only; the signature endpoint is, too.
  const token = getAdminToken();
  const sigRes = await fetch(`${BASE}/v1/admin/gallery/upload-signature`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const sigBody = await sigRes.json().catch(() => null);
  if (!sigRes.ok) {
    throw new Error(sigBody?.error || 'Could not start the upload.');
  }
  const sig = sigBody as UploadSignature;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.api_key);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${kind === 'video' ? 'video' : 'image'}/upload`;

  const result = await new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: any = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.secure_url) {
        resolve(body);
      } else {
        reject(new Error(body?.error?.message || `Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed — check your connection and try again.'));
    xhr.send(form);
  });

  return {
    type: kind,
    url: result.secure_url,
    thumbnail_url: kind === 'video' ? videoPoster(result.secure_url) : '',
    public_id: result.public_id,
  };
}
