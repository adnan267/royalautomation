import { useId, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

/** Label + control + error/hint wrapper with accessible wiring. */
export default function Field({ label, error, hint, required, className, children }) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, required })
    : children;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label} {required && <span className="text-accent" aria-hidden>*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-accent">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn('mt-1.5 text-sm text-muted')}>{hint}</p>
      ) : null}
    </div>
  );
}
