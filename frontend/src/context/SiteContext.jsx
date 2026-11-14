import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { defaultSettings, services as fallbackServices, industries as fallbackIndustries } from '@shared/content.js';

const SiteContext = createContext(null);

/**
 * Loads global website data (settings, services, industries) once.
 * If the API is unreachable the bundled default content is used so the
 * public website still renders.
 */
export function SiteProvider({ children }) {
  const [state, setState] = useState({
    settings: defaultSettings,
    services: fallbackServices,
    industries: fallbackIndustries,
    ready: false,
    offline: false,
  });

  const load = useCallback(async () => {
    try {
      const [settings, services, industries] = await Promise.all([
        api.get('/settings'),
        api.get('/services'),
        api.get('/industries'),
      ]);
      setState({ settings, services: services.items, industries: industries.items, ready: true, offline: false });
    } catch {
      setState((s) => ({ ...s, ready: true, offline: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => ({ ...state, reload: load }), [state, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
