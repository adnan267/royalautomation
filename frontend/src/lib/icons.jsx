import {
  Award, BadgeCheck, Bolt, Building2, CalendarCheck, CircuitBoard, Cog, Cpu, CupSoda, Droplets, Factory, Flame, Gauge,
  Handshake, Headset, HardHat, Lightbulb, Microchip, PlugZap, RefreshCcw, SearchCheck, Settings, ShieldCheck, Ship,
  Siren, Timer, Truck, Users, Wrench, Zap, Cable, Thermometer, Activity, Package,
} from 'lucide-react';

/** Icons selectable from the admin panel (stored by name in the database). */
export const ICONS = {
  Activity, Award, BadgeCheck, Bolt, Building2, Cable, CalendarCheck, CircuitBoard, Cog, Cpu, CupSoda, Droplets, Factory,
  Flame, Gauge, Handshake, Headset, HardHat, Lightbulb, Microchip, Package, PlugZap, RefreshCcw, SearchCheck, Settings,
  ShieldCheck, Ship, Siren, Thermometer, Timer, Truck, Users, Wrench, Zap,
};
export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, fallback = 'Settings', ...props }) {
  const C = ICONS[name] || ICONS[fallback] || Settings;
  return <C aria-hidden="true" {...props} />;
}

/* Simple brand glyphs for social links (lucide no longer ships brand icons). */
const svg = (d, props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="1em" height="1em" {...props}>
    <path d={d} />
  </svg>
);
export const SOCIAL = {
  facebook: { label: 'Facebook', icon: (p) => svg('M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8v3.8h2.2V22H14v-9.7h2.9l.4-3.8H14z', p) },
  linkedin: { label: 'LinkedIn', icon: (p) => svg('M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.6 4.77 6V21h-4v-5.1c0-1.22-.02-2.8-1.7-2.8-1.72 0-1.98 1.33-1.98 2.7V21h-4z', p) },
  instagram: { label: 'Instagram', icon: (p) => svg('M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.8a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.1c-.1-1.6-.4-3-1.6-4.2S17.6 1.4 16 1.3C14.3 1.2 9.7 1.2 8 1.3c-1.6.1-3 .4-4.2 1.6S2.2 5.5 2.1 7.1C2 8.8 2 13.2 2.1 14.9c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.1 0-7.8zm-2 9.6a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.7.4s-4.4.1-5.7-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.7s-.1-4.4.4-5.7a3.2 3.2 0 0 1 1.8-1.8c1.3-.5 4.3-.4 5.7-.4s4.4-.1 5.7.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.7s.1 4.4-.4 5.7z', p) },
  youtube: { label: 'YouTube', icon: (p) => svg('M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12z', p) },
  x: { label: 'X', icon: (p) => svg('M17.8 2H21l-7 8 8.2 11.9h-6.4l-5-6.6-5.8 6.6H1.8l7.5-8.6L1.4 2h6.6l4.5 6 5.3-6zm-1.1 18h1.8L7.4 3.9H5.5z', p) },
  tiktok: { label: 'TikTok', icon: (p) => svg('M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7z', p) },
};
