import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Eye, EyeOff, Film, Images, Link2, Loader2, Pencil, PlayCircle, Plus, Star, Trash2, UploadCloud } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { api, API_BASE } from '@/lib/api';
import { cn } from '@/lib/utils';
import { parseVideo, videoThumb } from '@/lib/video';
import SmartImage from '@/components/ui/SmartImage';
import { Alert, Spinner } from '@/components/ui/Feedback';
import { AField, Drawer, Modal, PageTitle, Toggle, useConfirm, useToast } from '../components/ui';
import { ImageField, MediaPicker, uploadImages } from '../components/MediaPicker';

/** Grabs a frame from a local video file to use as its thumbnail. */
function capturePoster(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    const done = (res) => { URL.revokeObjectURL(url); resolve(res); };
    const timer = setTimeout(() => done(null), 10000);
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    v.onloadeddata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 3); };
    v.onseeked = () => {
      const scale = Math.min(1, 1280 / (v.videoWidth || 1280));
      const c = document.createElement('canvas');
      c.width = Math.round((v.videoWidth || 1280) * scale); c.height = Math.round((v.videoHeight || 720) * scale);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((b) => { clearTimeout(timer); done(b ? new File([b], `${file.name.replace(/\.\w+$/, '')}-poster.jpg`, { type: 'image/jpeg' }) : null); }, 'image/jpeg', 0.85);
    };
    v.onerror = () => { clearTimeout(timer); done(null); };
  });
}

const albumProps = { list: 'gallery-albums', placeholder: 'e.g. Workshop, Site Work, Panels', className: 'input' };

function AddPhotos({ open, onClose, onDone, albums }) {
  const toast = useToast();
  const [album, setAlbum] = useState('');
  const [busy, setBusy] = useState('');
  const [picker, setPicker] = useState(false);
  const fileRef = useRef(null);

  async function create(urls) {
    await api.post('/gallery/bulk', { items: urls.map((image) => ({ type: 'image', image, album, published: true })) });
    toast(`${urls.length} photo${urls.length > 1 ? 's' : ''} added to the gallery`);
    onDone();
    onClose();
  }
  async function onFiles(files) {
    if (!files?.length) return;
    try {
      const list = Array.from(files).slice(0, 50);
      setBusy(`Uploading ${list.length} photo${list.length > 1 ? 's' : ''}…`);
      const created = await uploadImages(list);
      await create(created.map((m) => m.url));
    } catch (e) { toast(e.message, 'error'); } finally { setBusy(''); if (fileRef.current) fileRef.current.value = ''; }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title="Add Photos" width="max-w-xl">
      <div className="space-y-5">
        <AField label="Album (optional)" hint="Group photos, e.g. Workshop, Site Work, Control Panels."><input {...albumProps} value={album} onChange={(e) => setAlbum(e.target.value)} /></AField>
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }} className="rounded-xl border-2 border-dashed border-line bg-surface p-8 text-center">
          {busy ? <Loader2 className="mx-auto size-9 animate-spin text-brand" /> : <UploadCloud className="mx-auto size-9 text-brand" />}
          <p className="mt-2 font-semibold text-navy">{busy || 'Drag photos here'}</p>
          {!busy && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" className="btn btn-red btn-sm" onClick={() => fileRef.current?.click()}><Camera className="size-4" /> Upload photos</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPicker(true)}><Images className="size-4" /> From media library</button>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">Up to 50 at a time. Large photos are resized automatically.</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
        </div>
      </div>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={(url) => create([url]).catch((e) => toast(e.message, 'error'))} />
    </Modal>
  );
}

function AddVideo({ open, onClose, onDone, albums }) {
  const toast = useToast();
  const [mode, setMode] = useState('link');
  const [form, setForm] = useState({ videoUrl: '', title: '', album: '', caption: '', image: '' });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const parsed = parseVideo(form.videoUrl);

  useEffect(() => {
    if (!open) return;
    setForm({ videoUrl: '', title: '', album: '', caption: '', image: '' }); setFile(null); setProgress(null); setError('');
    api.get('/uploads/video-config').then(setCfg).catch(() => setCfg({ enabled: false, maxMb: 200 }));
  }, [open]);

  async function save() {
    setError('');
    try {
      let { videoUrl, image } = form;
      if (mode === 'link') {
        if (!parsed || parsed.provider === 'file') return setError('Paste a YouTube or Vimeo link, e.g. https://www.youtube.com/watch?v=…');
      } else {
        if (!file) return setError('Choose a video file.');
        if (file.size > cfg.maxMb * 1024 * 1024) return setError(`The video must be smaller than ${cfg.maxMb} MB.`);
        setProgress(0);
        if (!image) {
          const poster = await capturePoster(file);
          if (poster) image = (await uploadImages([poster]))[0]?.url || '';
        }
        const blob = await upload(`gallery/${file.name.replace(/[^\w.-]+/g, '-')}`, file, {
          access: 'public',
          handleUploadUrl: `${API_BASE}/api/uploads/video-token`,
          multipart: file.size > 50 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        videoUrl = blob.url;
      }
      await api.post('/gallery', { type: 'video', ...form, videoUrl, image, published: true });
      toast('Video added to the gallery');
      onDone();
      onClose();
    } catch (e) {
      setError(e.message || 'Upload failed');
    } finally { setProgress(null); }
  }

  const uploading = progress !== null;
  return (
    <Modal open={open} onClose={uploading ? () => {} : onClose} title="Add Video" width="max-w-xl"
      footer={<>
        <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={uploading}>Cancel</button>
        <button type="button" className="btn btn-blue btn-sm" onClick={save} disabled={uploading || (mode === 'file' && !cfg?.enabled)}>{uploading ? <><Spinner /> {progress}%</> : 'Add Video'}</button>
      </>}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface p-1" role="tablist">
          {[['link', 'YouTube / Vimeo link', Link2], ['file', 'Upload video file', Film]].map(([id, label, I]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => setMode(id)} className={cn('flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold', mode === id ? 'bg-white text-navy shadow' : 'text-muted')}>
              <I className="size-4" /> {label}
            </button>
          ))}
        </div>
        {error && <Alert>{error}</Alert>}
        {mode === 'link' ? (
          <AField label="Video link" hint="YouTube (including Shorts) or Vimeo. The thumbnail is added automatically.">
            <input className="input" value={form.videoUrl} onChange={(e) => set('videoUrl')(e.target.value.trim())} placeholder="https://www.youtube.com/watch?v=…" />
          </AField>
        ) : cfg && !cfg.enabled ? (
          <Alert tone="info">
            <strong>Direct video upload isn’t switched on yet.</strong> In Vercel open your project → <strong>Storage</strong> → <strong>Create → Blob</strong>, connect it to this project, then redeploy. Until then, use a YouTube link.
          </Alert>
        ) : (
          <div>
            <span className="label">Video file</span>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-line bg-surface p-5 text-left hover:border-brand">
              <UploadCloud className="size-8 shrink-0 text-brand" />
              <span className="min-w-0"><span className="block truncate font-semibold text-navy">{file ? file.name : 'Choose a video (MP4, WebM or MOV)'}</span>
                <span className="text-sm text-muted">{file ? `${(file.size / 1048576).toFixed(1)} MB` : `Up to ${cfg?.maxMb || 200} MB. MP4 (H.264) plays on all devices.`}</span></span>
            </button>
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {uploading && <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-brand transition-[width]" style={{ width: `${progress}%` }} /></div>}
          </div>
        )}
        {mode === 'link' && parsed?.thumb && <SmartImage src={parsed.thumb} alt="Video thumbnail" className="aspect-video rounded-lg" />}
        <div className="grid gap-4 sm:grid-cols-2">
          <AField label="Title (optional)"><input className="input" value={form.title} onChange={(e) => set('title')(e.target.value)} /></AField>
          <AField label="Album (optional)"><input {...albumProps} value={form.album} onChange={(e) => set('album')(e.target.value)} /></AField>
        </div>
        <AField label="Caption (optional)"><textarea rows={2} className="input resize-y" value={form.caption} onChange={(e) => set('caption')(e.target.value)} /></AField>
        <ImageField label="Custom thumbnail (optional)" value={form.image} onChange={set('image')} hint={mode === 'file' ? 'If empty, a frame from the video is used.' : 'If empty, the YouTube thumbnail is used.'} />
      </div>
    </Modal>
  );
}

export default function GalleryAdmin() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [adding, setAdding] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems((await api.get('/gallery?all=1&limit=500')).items); } catch (e) { toast(e.message, 'error'); } finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const albums = [...new Set(items.map((i) => i.album).filter(Boolean))];
  const shown = items.filter((i) => !type || i.type === type);
  const fields = (it) => ({ type: it.type, title: it.title || '', caption: it.caption || '', album: it.album || '', image: it.image || '', videoUrl: it.videoUrl || '', featured: !!it.featured, published: it.published !== false, order: it.order || 0, slug: it.slug });

  async function put(it, patch) {
    try { await api.put(`/gallery/${it._id}`, { ...fields(it), ...patch }); load(); } catch (e) { toast(e.message, 'error'); }
  }
  async function saveEdit() {
    setSaving(true);
    try { await api.put(`/gallery/${edit._id}`, fields(edit)); toast('Saved'); setEdit(null); load(); } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  }
  async function remove(it) {
    if (!(await confirm({ title: 'Delete from gallery?', message: it.type === 'video' && /blob\.vercel-storage/.test(it.videoUrl) ? 'The uploaded video file will also be deleted.' : 'This item will be removed from the gallery.' }))) return;
    try { await api.del(`/gallery/${it._id}`); toast('Deleted'); setEdit(null); load(); } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      <PageTitle title="Gallery" description="Photos and videos shown on the Gallery page and the homepage. “Featured” items appear first."
        actions={<>
          <button type="button" className="btn btn-red btn-sm" onClick={() => setAdding('photos')}><Camera className="size-4" /> Add Photos</button>
          <button type="button" className="btn btn-blue btn-sm" onClick={() => setAdding('video')}><PlayCircle className="size-4" /> Add Video</button>
        </>} />
      <div className="mb-5 inline-flex rounded-xl border border-line bg-white p-1">
        {[['', 'All'], ['image', 'Photos'], ['video', 'Videos']].map(([id, label]) => (
          <button key={id || 'all'} type="button" onClick={() => setType(id)} className={cn('rounded-lg px-4 py-2 text-sm font-semibold', type === id ? 'bg-navy text-white' : 'text-navy hover:bg-surface')}>
            {label} <span className="opacity-60">{id ? items.filter((i) => i.type === id).length : items.length}</span>
          </button>
        ))}
      </div>
      {loading ? <div className="py-16 text-center"><Loader2 className="mx-auto size-6 animate-spin text-brand" /></div> : shown.length === 0 ? (
        <div className="card py-16 text-center text-muted">
          <Images className="mx-auto size-10 text-brand/50" />
          <p className="mt-3">No gallery items yet.</p>
          <button type="button" className="btn btn-red btn-sm mt-4" onClick={() => setAdding('photos')}><Plus className="size-4" /> Add your first photos</button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {shown.map((it) => (
            <li key={it._id} className={cn('card overflow-hidden', !it.published && 'opacity-60')}>
              <button type="button" onClick={() => setEdit(it)} className="relative block w-full">
                <SmartImage src={it.type === 'video' ? videoThumb(it) : it.image} alt="" icon={it.type === 'video' ? 'Activity' : 'Factory'} className="aspect-[4/3]" />
                <span className={cn('absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-bold uppercase', it.type === 'video' ? 'bg-accent text-white' : 'bg-white/90 text-navy')}>{it.type === 'video' ? 'Video' : 'Photo'}</span>
              </button>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-navy">{it.title || <span className="font-normal text-muted">Untitled</span>}</p>
                <p className="truncate text-xs text-muted">{it.album || 'No album'}</p>
                <div className="mt-2 flex items-center gap-1">
                  <button type="button" onClick={() => put(it, { published: !it.published })} className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-brand" title={it.published ? 'Hide' : 'Publish'} aria-label={it.published ? 'Hide' : 'Publish'}>{it.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                  <button type="button" onClick={() => put(it, { featured: !it.featured })} className={cn('grid size-9 place-items-center rounded-md hover:bg-surface', it.featured ? 'text-amber-500' : 'text-muted')} title="Featured" aria-label="Toggle featured"><Star className={cn('size-4', it.featured && 'fill-current')} /></button>
                  <button type="button" onClick={() => setEdit(it)} className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-brand" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button type="button" onClick={() => remove(it)} className="ml-auto grid size-9 place-items-center rounded-md text-muted hover:bg-accent-50 hover:text-accent" aria-label="Delete"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <datalist id="gallery-albums">{albums.map((a) => <option key={a} value={a} />)}</datalist>
      <AddPhotos open={adding === 'photos'} onClose={() => setAdding(null)} onDone={load} albums={albums} />
      <AddVideo open={adding === 'video'} onClose={() => setAdding(null)} onDone={load} albums={albums} />

      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?.type === 'video' ? 'Edit Video' : 'Edit Photo'} width="max-w-xl"
        footer={edit && <>
          <button type="button" className="btn btn-outline btn-sm mr-auto text-accent" onClick={() => remove(edit)}><Trash2 className="size-4" /> Delete</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEdit(null)}>Cancel</button>
          <button type="button" className="btn btn-blue btn-sm" onClick={saveEdit} disabled={saving}>{saving && <Spinner />} Save</button>
        </>}>
        {edit && (
          <div className="space-y-5">
            <ImageField label={edit.type === 'video' ? 'Thumbnail' : 'Photo'} value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
            {edit.type === 'video' && (
              <AField label="Video link" hint={/blob\.vercel-storage/.test(edit.videoUrl) ? 'Uploaded video file.' : 'YouTube or Vimeo link.'}>
                <input className="input" value={edit.videoUrl} onChange={(e) => setEdit({ ...edit, videoUrl: e.target.value.trim() })} />
              </AField>
            )}
            <AField label="Title"><input className="input" value={edit.title || ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></AField>
            <AField label="Album"><input {...albumProps} value={edit.album || ''} onChange={(e) => setEdit({ ...edit, album: e.target.value })} /></AField>
            <AField label="Caption"><textarea rows={3} className="input resize-y" value={edit.caption || ''} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} /></AField>
            <AField label="Display order"><input type="number" min="0" className="input" value={edit.order || 0} onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) })} /></AField>
            <Toggle checked={!!edit.featured} onChange={(v) => setEdit({ ...edit, featured: v })} label="Featured" description="Shown first and on the homepage." />
            <Toggle checked={edit.published !== false} onChange={(v) => setEdit({ ...edit, published: v })} label="Published" />
          </div>
        )}
      </Drawer>
    </>
  );
}
