/** Renders text where *words* wrapped in asterisks appear in the brand red. */
export default function Highlight({ text = '', className = 'text-accent' }) {
  const parts = String(text).split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') ? (
      <span key={i} className={className}>
        {p.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
