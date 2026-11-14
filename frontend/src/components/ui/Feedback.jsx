import { Loader2, AlertTriangle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin', className)} aria-hidden />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-muted" role="status" aria-live="polite">
      <Spinner className="text-brand" /> {label}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/70', className)} />;
}

export function EmptyState({ icon: I = Inbox, title, text, children, className }) {
  return (
    <div className={cn('rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center', className)}>
      <I className="mx-auto size-10 text-brand/60" aria-hidden />
      <h3 className="mt-4 font-display text-2xl font-bold uppercase text-navy">{title}</h3>
      {text && <p className="mx-auto mt-2 max-w-lg text-muted">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function Alert({ tone = 'error', children, className }) {
  const tones = {
    error: 'border-accent/30 bg-accent-50 text-accent-600',
    success: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    info: 'border-brand/30 bg-brand-50 text-brand-800',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', tones[tone], className)}>
      {tone === 'error' && <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div>{children}</div>
    </div>
  );
}
