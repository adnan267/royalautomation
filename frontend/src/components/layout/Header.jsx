import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { productCategories } from '@shared/content.js';

function useMenus() {
  const { services, industries } = useSite();
  return [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    {
      label: 'Services',
      to: '/services',
      wide: true,
      items: services.map((s) => ({ label: s.title, to: `/services/${s.slug}`, icon: s.icon, desc: s.excerpt })),
      footer: { label: 'View all services', to: '/services' },
    },
    {
      label: 'Industries',
      to: '/industries',
      items: industries.map((i) => ({ label: i.title, to: `/industries#${i.slug}`, icon: i.icon })),
      footer: { label: 'All industries', to: '/industries' },
    },
    {
      label: 'Store',
      to: '/store',
      items: productCategories.map((c) => ({ label: c, to: `/store?category=${encodeURIComponent(c)}`, icon: 'Package' })),
      footer: { label: 'Browse the full store', to: '/store' },
    },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact', to: '/contact' },
  ];
}

function Dropdown({ menu, active }) {
  const [open, setOpen] = useState(false);
  const timer = useRef();
  const ref = useRef();
  const { pathname, search, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, search, hash]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const enter = () => { clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 140); };

  return (
    <li ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn('nav-link flex items-center gap-1', active && 'is-active')}
      >
        {menu.label}
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16 }}
            className={cn('absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4', menu.wide ? 'w-[640px]' : 'w-[300px]')}
          >
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-lift">
              <span className="block h-1 bg-gradient-to-r from-brand via-brand to-accent" />
              <ul className={cn('grid gap-1 p-3', menu.wide && 'grid-cols-2')}>
                {menu.items.map((it) => (
                  <li key={it.to}>
                    <Link to={it.to} className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-surface">
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                        <Icon name={it.icon} className="size-[18px]" />
                      </span>
                      <span>
                        <span className="block font-semibold leading-snug text-navy">{it.label}</span>
                        {it.desc && <span className="mt-0.5 line-clamp-1 block text-[13px] text-muted">{it.desc}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to={menu.footer.to} className="flex items-center justify-between border-t border-line bg-surface px-5 py-3 text-sm font-semibold text-brand hover:text-brand-700">
                {menu.footer.label} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileMenu({ menus, onClose }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <motion.div
      id="mobile-menu"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-t border-line bg-white lg:hidden"
    >
      <nav aria-label="Mobile" className="container-x max-h-[calc(100dvh-120px)] overflow-y-auto py-3">
        <ul className="divide-y divide-line">
          {menus.map((m) => (
            <li key={m.label}>
              {m.items ? (
                <>
                  <div className="flex items-center justify-between">
                    <NavLink to={m.to} onClick={onClose} className="flex-1 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-navy">{m.label}</NavLink>
                    <button type="button" className="p-3 text-navy" aria-expanded={expanded === m.label} aria-label={`Show ${m.label} links`} onClick={() => setExpanded((e) => (e === m.label ? null : m.label))}>
                      <ChevronDown className={cn('size-5 transition-transform', expanded === m.label && 'rotate-180')} />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded === m.label && (
                      <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pb-3">
                        {m.items.map((it) => (
                          <li key={it.to}>
                            <Link to={it.to} onClick={onClose} className="flex items-center gap-3 rounded-md px-2 py-2.5 text-[15px] text-ink hover:bg-surface">
                              <Icon name={it.icon} className="size-4 text-brand" /> {it.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink to={m.to} end onClick={onClose} className={({ isActive }) => cn('block py-3.5 font-display text-lg font-bold uppercase tracking-wide', isActive ? 'text-brand' : 'text-navy')}>
                  {m.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        <Link to="/request-a-quote" onClick={onClose} className="btn btn-blue mt-4 mb-2 w-full">Get a Quote <ArrowRight className="size-4" /></Link>
      </nav>
    </motion.div>
  );
}

export default function Header() {
  const menus = useMenus();
  const { settings } = useSite();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <header className={cn('sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow', scrolled ? 'shadow-[0_8px_30px_-12px_rgba(6,38,83,0.25)]' : 'shadow-[0_1px_0_#dfe6ef]')}>
      <div className={cn('container-x flex items-center justify-between gap-6 transition-[height] duration-300', scrolled ? 'h-[70px]' : 'h-[84px]')}>
        <Link to="/" className="shrink-0" aria-label={`${settings.company?.name || 'The Royal Automation'} — Home`}>
          <img
            src={settings.company?.logo || '/brand/logo.jpg'}
            alt={`${settings.company?.name || 'The Royal Automation'} — ${settings.company?.tagline || ''}`}
            width="641"
            height="278"
            className={cn('w-auto transition-[height] duration-300', scrolled ? 'h-12' : 'h-[58px]')}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-3">
            {menus.map((m) =>
              m.items ? (
                <Dropdown key={m.label} menu={m} active={isActive(m.to)} />
              ) : (
                <li key={m.label}>
                  <NavLink to={m.to} end={m.to === '/'} className={({ isActive: a }) => cn('nav-link', a && 'is-active')}>
                    {m.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/request-a-quote" className="btn btn-blue btn-sm hidden sm:inline-flex">Get a Quote</Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-line text-navy lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>{mobileOpen && <MobileMenu menus={menus} onClose={() => setMobileOpen(false)} />}</AnimatePresence>
    </header>
  );
}
