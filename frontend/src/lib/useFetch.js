import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/**
 * Fetches `path` from the API. While loading, or if the request fails,
 * `fallback` (if provided) is returned as data so public pages keep working.
 */
export function useFetch(path, { fallback, skip = false, deps = [] } = {}) {
  const [data, setData] = useState(fallback ?? null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const load = useCallback(async (signal) => {
    if (skip || !path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(path, { signal });
      setData(res);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err);
      if (fallbackRef.current !== undefined) setData(fallbackRef.current);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip, ...deps]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  return { data, loading, error, reload: () => load(), setData };
}
