import { cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, X, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICON_NAMES, Icon } from '@/lib/icons';

/* ------------------------------- Toasts ------------------------------- */
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
              className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lift', t.tone === 'error' ? 'border-accent/30 bg-white text-accent-600' : 'border-emerald-200 bg-white text-emerald-800')}>
              {t.tone === 'error' ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
              <span className="flex-1 text-ink">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------------------- Modal / Drawer --------------------------- */
function useLockScroll(open) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-3xl' }) {
  useLockScroll(open);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    setTimeout(() => ref.current?.focus(), 50);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.25 }}
            className={cn('absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl outline-none', width)}>
            <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h2 className="font-display text-2xl font-bold uppercase text-navy">{title}</h2>
              <button type="button" onClick={onClose} className="rounded-md p-2 text-muted hover:bg-surface" aria-label="Close"><X className="size-5" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  useLockScroll(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <motion.div className="absolute inset-0 bg-navy-950/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className={cn('relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl', width)}>
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold uppercase text-navy">{title}</h2>
              <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted hover:bg-surface" aria-label="Close"><X className="size-5" /></button>
            </header>
            <div className="overflow-y-auto p-5">{children}</div>
            {footer && <footer className="flex justify-end gap-3 border-t border-line bg-surface px-5 py-3">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Promise-based confirmation dialog. */
const ConfirmCtx = createContext(async () => false);
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
  const close = (v) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} title={state?.title || 'Are you sure?'}
        footer={<>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => close(false)}>Cancel</button>
          <button type="button" className="btn btn-red btn-sm" onClick={() => close(true)}>{state?.confirmLabel || 'Delete'}</button>
        </>}>
        <p className="text-ink">{state?.message}</p>
      </Modal>
    </ConfirmCtx.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmCtx);

/* ------------------------------- Inputs ------------------------------- */
export function AField({ label, hint, error, children, className }) {
  const id = useId();
  // Link the label to native form controls so it is announced by screen readers.
  const native = isValidElement(children) && ['input', 'textarea', 'select'].includes(children.type);
  const control = native
    ? cloneElement(children, { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error || hint ? `${id}-d` : undefined })
    : children;
  return (
    <div className={className}>
      {label && (native ? <label htmlFor={id} className="label">{label}</label> : <span className="label">{label}</span>)}
      {control}
      {error ? <p id={`${id}-d`} className="mt-1 text-sm font-medium text-accent">{error}</p> : hint ? <p id={`${id}-d`} className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand' : 'bg-slate-300')}>
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
      <span><span className="block font-semibold text-navy">{label}</span>{description && <span className="block text-sm text-muted">{description}</span>}</span>
    </label>
  );
}

/** Editable list of strings (features, benefits, paragraphs...). */
export function ListEditor({ value = [], onChange, placeholder = 'Add item', multiline = false, max = 30 }) {
  const update = (i, v) => onChange(value.map((x, j) => (j === i ? v : x)));
  const move = (i, d) => {
    const next = [...value];
    const [it] = next.splice(i, 1);
    next.splice(i + d, 0, it);
    onChange(next);
  };
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="flex items-start gap-2">
          <Input className={cn('input', multiline && 'min-h-24 resize-y')} value={v} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} rows={multiline ? 4 : undefined} />
          <div className="flex shrink-0 flex-col">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-muted hover:bg-surface disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
            <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-muted hover:bg-surface disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
          </div>
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="mt-1 rounded p-2 text-muted hover:bg-accent-50 hover:text-accent" aria-label="Remove"><Trash2 className="size-4" /></button>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, ''])} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-brand/50 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-50">
          <Plus className="size-4" /> {placeholder}
        </button>
      )}
    </div>
  );
}

/** Editable list of objects with configurable sub-fields. */
export function ObjectListEditor({ value = [], onChange, fields, addLabel = 'Add item', max = 10, newItem = {} }) {
  const update = (i, k, v) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="rounded-lg border border-line bg-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">#{i + 1}</span>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} className="rounded p-1 text-muted hover:bg-white disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
              <button type="button" disabled={i === value.length - 1} onClick={() => { const n = [...value]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }} className="rounded p-1 text-muted hover:bg-white disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-1 text-muted hover:bg-accent-50 hover:text-accent" aria-label="Remove"><Trash2 className="size-4" /></button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                <span className="mb-1 block text-xs font-semibold text-navy">{f.label}</span>
                {f.type === 'icon' ? (
                  <IconSelect value={item[f.name]} onChange={(v) => update(i, f.name, v)} />
                ) : f.type === 'number' ? (
                  <input type="number" className="input" value={item[f.name] ?? ''} onChange={(e) => update(i, f.name, e.target.value === '' ? '' : Number(e.target.value))} />
                ) : f.type === 'textarea' ? (
                  <textarea className="input resize-y" rows={2} value={item[f.name] || ''} onChange={(e) => update(i, f.name, e.target.value)} />
                ) : (
                  <input className="input" value={item[f.name] || ''} onChange={(e) => update(i, f.name, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {value.length < max && (
        <button type="button" onClick={() => onChange([...value, { ...newItem }])} className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-brand/50 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-50">
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function IconSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-white"><Icon name={value} className="size-5" /></span>
      <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Default</option>
        {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    new: 'bg-accent-50 text-accent-600 ring-accent/20',
    in_review: 'bg-amber-50 text-amber-700 ring-amber-200',
    read: 'bg-amber-50 text-amber-700 ring-amber-200',
    quoted: 'bg-brand-50 text-brand-700 ring-brand/20',
    replied: 'bg-brand-50 text-brand-700 ring-brand/20',
    in_progress: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    closed: 'bg-slate-100 text-slate-600 ring-slate-200',
    archived: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', map[status] || map.closed)}>{String(status).replace(/_/g, ' ')}</span>;
}

export function LoadingRow({ cols = 5 }) {
  return (
    <tr><td colSpan={cols} className="px-4 py-10 text-center text-muted"><Loader2 className="mx-auto size-5 animate-spin text-brand" /></td></tr>
  );
}

export function PageTitle({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold uppercase text-navy md:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
