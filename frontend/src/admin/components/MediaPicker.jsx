import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, Link2, Loader2, Search, UploadCloud } from 'lucide-react';
import { api, assetUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import { Modal, useToast } from './ui';

const MAX_EDGE = 2400;
const TARGET_BYTES = 3.5 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit

/** Downscales large JPG/PNG/WEBP photos in the browser before upload. */
async function prepareImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) { bitmap.close?.(); return file; }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  for (const q of [0.9, 0.8, 0.7, 0.6]) {
    // eslint-disable-next-line no-await-in-loop
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', q));
    if (blob && blob.size <= TARGET_BYTES) return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  }
  return file;
}

/** Uploads images one at a time (each request stays small). Returns created media docs. */
export async function uploadImages(fileList) {
  const created = [];
  for (const original of Array.from(fileList)) {
    // eslint-disable-next-line no-await-in-loop
    const file = await prepareImage(original);
    if (file.size > 4.2 * 1024 * 1024) throw new Error(`“${original.name}” is too large. Please use an image under 4 MB.`);
    const form = new FormData();
    form.append('files', file);
    // eslint-disable-next-line no-await-in-loop
    const res = await api.upload('/media', form);
    created.push(...res.items);
  }
  return created;
}

export function MediaPicker({ open, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const toast = useToast();
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/media?limit=120${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      setItems(res.items);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [q, toast]);

  useEffect(() => { if (open) load(); }, [open, load]);

  async function onUpload(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const created = await uploadImages(files);
      setItems((prev) => [...created, ...prev]);
      setSelected(created[0]);
      toast(`${created.length} image${created.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Media Library" width="max-w-4xl"
      footer={<>
        <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-blue btn-sm" disabled={!selected} onClick={() => { onSelect(selected.url, selected); onClose(); }}>Use Selected Image</button>
      </>}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search images…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="button" className="btn btn-red btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onUpload(e.target.files)} />
      </div>
      {loading ? (
        <div className="py-16 text-center"><Loader2 className="mx-auto size-6 animate-spin text-brand" /></div>
      ) : items.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-line py-14 text-center text-muted">
          <ImagePlus className="mx-auto size-8 text-brand/60" />
          <p className="mt-2">No images yet. Upload your first image.</p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {items.map((m) => (
            <li key={m._id}>
              <button type="button" onClick={() => setSelected(m)} className={cn('relative block w-full overflow-hidden rounded-lg border-2', selected?._id === m._id ? 'border-brand ring-2 ring-brand/30' : 'border-transparent')} title={m.originalName}>
                <SmartImage src={m.url} alt={m.alt} className="aspect-square bg-surface" />
                {selected?._id === m._id && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-brand text-white"><Check className="size-4" /></span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/** Image field: preview + library picker + direct URL entry. */
export function ImageField({ value, onChange, label = 'Image', hint }) {
  const [open, setOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative w-full overflow-hidden rounded-lg border border-line sm:w-48">
          <SmartImage src={value} alt="" className="aspect-[4/3]" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-blue btn-sm" onClick={() => setOpen(true)}><ImagePlus className="size-4" /> Choose / Upload</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowUrl((s) => !s)}><Link2 className="size-4" /> URL</button>
            {value && <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange('')}>Remove</button>}
          </div>
          {(showUrl || (value && !value.startsWith('/uploads/'))) && (
            <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://… or /uploads/media/…" />
          )}
          {value && <a href={assetUrl(value)} target="_blank" rel="noopener noreferrer" className="block truncate py-1 text-xs text-brand hover:underline">{value}</a>}
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(url) => onChange(url)} />
    </div>
  );
}
