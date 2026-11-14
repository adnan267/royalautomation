const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

/** Deep merge: objects merge recursively, arrays and primitives replace, undefined is skipped. */
export function deepMerge(target, source) {
  if (!isPlainObject(source)) return source === undefined ? target : source;
  const out = isPlainObject(target) ? { ...target } : {};
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    out[key] = isPlainObject(value) ? deepMerge(out[key], value) : value;
  }
  return out;
}
