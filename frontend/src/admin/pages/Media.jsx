import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, ImagePlus, Loader2, Search, Trash2, UploadCloud } from 'lucide-react';
import { api, assetUrl } from '@/lib/api';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import SmartImage from '@/components/ui/SmartImage';
import { Drawer, PageTitle, useConfirm, useToast } from '../components/ui';
import { uploadImages } from '../components/MediaPicker';

export default function Media() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [alt, setAlt] = useState('');
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await api.get(`/media?limit=200${q ? `&q=${encodeURIComponent(q)}` : ''}`)).items); }
    catch (e) { toast(e.message, 'error'); } finally { setLoading(false); }
  }, [q, toast]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function onUpload(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const created = await uploadImages(files);
      toast(`${created.length} image${created.length > 1 ? 's' : ''} uploaded and optimised`);
      load();
    } catch (e) { toast(e.message, 'error'); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function saveAlt() {
    try { const u = await api.patch(`/media/${sel._id}`, { alt }); setSel(u); toast('Alt text saved'); load(); }
    catch (e) { toast(e.message, 'error'); }
  }
  async function remove() {
    if (!(await confirm({ title: 'Delete image?', message: 'Pages still using this image will show a placeholder instead.' }))) return;
    try { await api.del(`/media/${sel._id}`); toast('Image deleted'); setSel(null); load(); }
    catch (e) { toast(e.message, 'error'); }
  }
  const copy = (text) => navigator.clipboard?.writeText(text).then(() => toast('Copied to clipboard'));

  return (
    <>
      <PageTitle title="Media Library" description="Upload photos once and reuse them across services, products, projects and settings. Images are resized and converted to WebP automatically." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onUpload(e.dataTransfer.files); }}
        className={cn('mb-6 rounded-xl border-2 border-dashed p-8 text-center transition', drag ? 'border-brand bg-brand-50' : 'border-line bg-white')}
      >
        {uploading ? <Loader2 className="mx-auto size-8 animate-spin text-brand" /> : <UploadCloud className="mx-auto size-8 text-brand" />}
        <p className="mt-2 text-navy">Drag images here or <button type="button" className="font-semibold text-brand hover:underline" onClick={() => fileRef.current?.click()}>browse</button></p>
        <p className="text-sm text-muted">JPG, PNG, WEBP, GIF or SVG · up to 10 files at a time</p>
        <input ref={fileRef} type="file" multiple accept="image/*" className="sr-only" onChange={(e) => onUpload(e.target.files)} />
      </div>
      <label className="relative mb-5 block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input className="input py-2 pl-9" placeholder="Search by file name or alt text…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {loading ? <div className="py-16 text-center"><Loader2 className="mx-auto size-6 animate-spin text-brand" /></div> : items.length === 0 ? (
        <div className="card py-16 text-center text-muted"><ImagePlus className="mx-auto size-10 text-brand/50" /><p className="mt-3">No images uploaded yet.</p></div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {items.map((m) => (
            <li key={m._id}>
              <button type="button" onClick={() => { setSel(m); setAlt(m.alt || ''); }} className="group card block w-full overflow-hidden text-left transition hover:shadow-lift">
                <SmartImage src={m.url} alt={m.alt} className="aspect-square bg-surface" imgClassName="transition group-hover:scale-105" />
                <span className="block truncate px-3 py-2 text-xs text-muted">{m.originalName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Drawer open={!!sel} onClose={() => setSel(null)} title="Image details" width="max-w-xl"
        footer={sel && <button type="button" className="btn btn-outline btn-sm mr-auto text-accent" onClick={remove}><Trash2 className="size-4" /> Delete</button>}>
        {sel && (
          <div className="space-y-5">
            <SmartImage src={sel.url} alt={sel.alt} className="aspect-video rounded-lg border border-line bg-surface" imgClassName="object-contain" />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">File</dt><dd className="truncate font-medium text-navy">{sel.originalName}</dd></div>
              <div><dt className="text-muted">Size</dt><dd className="font-medium text-navy">{formatBytes(sel.size)}{sel.width ? ` · ${sel.width}×${sel.height}` : ''}</dd></div>
              <div><dt className="text-muted">Uploaded</dt><dd className="font-medium text-navy">{formatDate(sel.createdAt, true)}</dd></div>
            </dl>
            <div>
              <span className="label">Image path</span>
              <div className="flex gap-2"><input readOnly className="input font-mono text-sm" value={sel.url} /><button type="button" className="btn btn-outline btn-sm" onClick={() => copy(sel.url)}><Copy className="size-4" /></button></div>
              <a href={assetUrl(sel.url)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-brand hover:underline">Open full size</a>
            </div>
            <div>
              <label className="label" htmlFor="alt">Alt text</label>
              <input id="alt" className="input" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the image shows" />
              <button type="button" className="btn btn-blue btn-sm mt-3" onClick={saveAlt}>Save alt text</button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
