import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useSite } from '@/context/SiteContext';

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) return undefined;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 1400, 1);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/** Animated statistics — rendered only when real figures are entered in Admin → Settings → Homepage. */
export default function Stats() {
  const { settings } = useSite();
  const stats = (settings.home?.stats || []).filter((s) => s.label && Number(s.value) > 0);
  if (!stats.length) return null;
  return (
    <section className="bg-navy py-14 text-white" aria-label="Company figures">
      <dl className={`container-x grid gap-8 text-center sm:grid-cols-2 ${['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'][Math.min(stats.length, 4)]}`}>
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/70">{s.label}</dt>
            <dd className="font-display text-5xl font-extrabold text-white"><Counter value={Number(s.value)} suffix={s.suffix || ''} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
