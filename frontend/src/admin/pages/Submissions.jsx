import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Building2, ChevronLeft, ChevronRight, Download, Mail, MessageCircle, Paperclip, Phone, Search, Send, Trash2 } from 'lucide-react';
import { api, API_BASE } from '@/lib/api';
import { cn, formatBytes, formatDate, mailHref, statusLabel, telHref, waHref } from '@/lib/utils';
import { Spinner } from '@/components/ui/Feedback';
import { Drawer, LoadingRow, PageTitle, StatusPill, useConfirm, useToast } from '../components/ui';

const CONFIG = {
  quotes: {
    title: 'Quote Requests',
    description: 'Requests submitted through the “Request a Quote” form.',
    statuses: ['new', 'in_review', 'quoted', 'in_progress', 'completed', 'closed'],
    name: (r) => r.fullName,
    company: (r) => r.companyName,
    topic: (r) => r.service || '—',
    fields: [
      ['Full name', 'fullName'], ['Company', 'companyName'], ['Email', 'email'], ['Phone', 'phone'],
      ['Industry', 'industry'], ['Required service', 'service'], ['Preferred contact', 'preferredContact'],
    ],
    long: [['Equipment / machine details', 'equipmentDetails'], ['Problem description', 'problemDescription']],
  },
  inquiries: {
    title: 'Contact Inquiries',
    description: 'Messages submitted through the contact form.',
    statuses: ['new', 'read', 'replied', 'archived'],
    name: (r) => r.name,
    company: (r) => r.company,
    topic: (r) => r.subject || '—',
    fields: [['Name', 'name'], ['Company', 'company'], ['Email', 'email'], ['Phone', 'phone'], ['Subject', 'subject']],
    long: [['Message', 'message']],
  },
};

async function downloadAttachment(id, a) {
  const res = await fetch(`${API_BASE}/api/quotes/${id}/attachments/${encodeURIComponent(a.filename)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = a.originalName || a.filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function Detail({ kind, item, onChange, onDelete }) {
  const cfg = CONFIG[kind];
  const toast = useToast();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const name = cfg.name(item);

  async function patch(body) {
    setBusy(true);
    try {
      const updated = await api.patch(`/${kind}/${item._id}`, body);
      onChange(updated);
      toast('Saved');
      setNote('');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const subject = `Re: your ${kind === 'quotes' ? 'quote request' : 'enquiry'} ${item.reference}`;
  const greeting = `Hello ${name?.split(' ')[0] || ''}, thank you for contacting The Royal Automation regarding ${item.service || item.subject || 'your requirement'} (ref ${item.reference}).`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-surface px-3 py-1.5 font-mono text-sm text-navy">{item.reference}</span>
        <StatusPill status={item.status} />
        <span className="text-sm text-muted">Received {formatDate(item.createdAt, true)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={mailHref(item.email, subject)} className="btn btn-blue btn-sm"><Mail className="size-4" /> Email</a>
        {item.phone && <a href={telHref(item.phone)} className="btn btn-outline btn-sm"><Phone className="size-4" /> Call</a>}
        {item.phone && <a href={waHref(item.phone, greeting)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><MessageCircle className="size-4" /> WhatsApp</a>}
      </div>

      <dl className="grid gap-x-6 gap-y-4 rounded-lg border border-line p-5 sm:grid-cols-2">
        {cfg.fields.map(([label, key]) => (
          <div key={key}><dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt><dd className="mt-0.5 break-words text-navy">{item[key] ? (key === 'preferredContact' ? statusLabel(item[key]) : item[key]) : '—'}</dd></div>
        ))}
      </dl>
      {cfg.long.map(([label, key]) => (
        <div key={key}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</h3>
          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface p-4 text-ink">{item[key] || '—'}</p>
        </div>
      ))}

      {item.attachments?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Attachments</h3>
          <ul className="mt-2 space-y-2">
            {item.attachments.map((a) => (
              <li key={a.filename} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                <Paperclip className="size-4 text-brand" /> <span className="min-w-0 flex-1 truncate">{a.originalName}</span>
                <span className="text-sm text-muted">{formatBytes(a.size)}</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => downloadAttachment(item._id, a).catch((e) => toast(e.message, 'error'))}><Download className="size-4" /> Download</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-line p-5">
        <label className="label" htmlFor="status">Status</label>
        <div className="flex gap-2">
          <select id="status" className="input" value={item.status} disabled={busy} onChange={(e) => patch({ status: e.target.value })}>
            {cfg.statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
        <label className="label mt-5" htmlFor="note">Add internal note</label>
        <textarea id="note" rows={3} className="input resize-y" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Called customer, site visit booked for Tuesday" />
        <button type="button" className="btn btn-navy btn-sm mt-3" disabled={!note.trim() || busy} onClick={() => patch({ note: note.trim() })}>{busy ? <Spinner /> : <Send className="size-4" />} Add Note</button>
        {item.notes?.length > 0 && (
          <ol className="mt-5 space-y-3 border-l-2 border-brand/30 pl-4">
            {[...item.notes].reverse().map((n) => (
              <li key={n._id || n.at}>
                <p className="text-ink">{n.text}</p>
                <p className="text-xs text-muted">{n.by} · {formatDate(n.at, true)}</p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"><Trash2 className="size-4" /> Delete this {kind === 'quotes' ? 'request' : 'inquiry'}</button>
    </div>
  );
}

export default function Submissions({ kind }) {
  const cfg = CONFIG[kind];
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, counts: {} });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page, limit, ...(status && { status }), ...(q && { q }) });
      setData(await api.get(`/${kind}?${qs}`));
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [kind, page, status, q, toast]);

  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);
  useEffect(() => { setStatus(''); setQ(''); setPage(1); setOpen(null); }, [kind]);
  useEffect(() => {
    const id = params.get('open');
    if (id) api.get(`/${kind}/${id}`).then(setOpen).catch(() => {});
  }, [params, kind]);

  const openItem = async (item) => {
    setOpen(item);
    if (item.status === 'new' && kind === 'inquiries') {
      const updated = await api.patch(`/${kind}/${item._id}`, { status: 'read' }).catch(() => null);
      if (updated) { setOpen(updated); load(); }
    }
  };
  const close = () => { setOpen(null); if (params.get('open')) setParams({}, { replace: true }); };
  const remove = async () => {
    if (!(await confirm({ title: 'Delete permanently?', message: `This will delete ${open.reference} and any attachments. This cannot be undone.` }))) return;
    try {
      await api.del(`/${kind}/${open._id}`);
      toast('Deleted');
      close();
      load();
    } catch (e) { toast(e.message, 'error'); }
  };

  const totalAll = Object.values(data.counts || {}).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(data.total / limit));

  return (
    <>
      <PageTitle title={cfg.title} description={cfg.description} />
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0" role="tablist">
            {['', ...cfg.statuses].map((s) => (
              <button key={s || 'all'} type="button" role="tab" aria-selected={status === s} onClick={() => { setStatus(s); setPage(1); }}
                className={cn('shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition', status === s ? 'bg-navy text-white' : 'bg-surface text-navy hover:bg-brand-50')}>
                {s ? statusLabel(s) : 'All'} <span className="ml-1 opacity-70">{s ? data.counts?.[s] ?? 0 : totalAll}</span>
              </button>
            ))}
          </div>
          <label className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input className="input py-2 pl-9" placeholder="Search name, email, reference…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </label>
        </div>
        {/* Phones: card list */}
        <ul className="divide-y divide-line md:hidden">
          {loading ? (
            <li className="py-10 text-center text-muted">Loading…</li>
          ) : data.items.length === 0 ? (
            <li className="px-4 py-12 text-center text-muted">No {kind === 'quotes' ? 'quote requests' : 'inquiries'} found.</li>
          ) : data.items.map((r) => (
            <li key={r._id}>
              <button type="button" onClick={() => openItem(r)} className="block w-full px-4 py-4 text-left active:bg-brand-50">
                <span className="flex items-start justify-between gap-3">
                  <span className={cn('min-w-0 text-navy', r.status === 'new' && 'font-bold')}>{cfg.name(r)}</span>
                  <StatusPill status={r.status} />
                </span>
                <span className="mt-1 block truncate text-sm text-ink">{cfg.topic(r)}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span className="font-mono">{r.reference}</span>{r.attachments?.length > 0 && <Paperclip className="size-3.5 text-brand" aria-label="Has attachments" />}<span>· {formatDate(r.createdAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">{kind === 'quotes' ? 'Service' : 'Subject'}</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? <LoadingRow /> : data.items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-14 text-center text-muted">No {kind === 'quotes' ? 'quote requests' : 'inquiries'} found.</td></tr>
              ) : data.items.map((r) => (
                <tr key={r._id} onClick={() => openItem(r)} className={cn('cursor-pointer hover:bg-brand-50/50', r.status === 'new' && 'font-semibold')}>
                  <td className="px-4 py-3 font-mono text-xs text-navy">{r.reference}{r.attachments?.length > 0 && <Paperclip className="ml-1 inline size-3.5 text-brand" aria-label="Has attachments" />}</td>
                  <td className="px-4 py-3"><span className="block text-navy">{cfg.name(r)}</span><span className="flex items-center gap-1 text-xs font-normal text-muted">{cfg.company(r) && <><Building2 className="size-3" />{cfg.company(r)} · </>}{r.email}</span></td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink">{cfg.topic(r)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-normal text-muted">{formatDate(r.createdAt, true)}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
            <span className="text-muted">Page {page} of {pages} · {data.total} total</span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="size-4" /> Prev</button>
              <button type="button" className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="size-4" /></button>
            </div>
          </div>
        )}
      </div>
      <Drawer open={!!open} onClose={close} title={open ? cfg.name(open) : ''} width="max-w-2xl">
        {open && <Detail kind={kind} item={open} onChange={(u) => { setOpen(u); load(); }} onDelete={remove} />}
      </Drawer>
    </>
  );
}
