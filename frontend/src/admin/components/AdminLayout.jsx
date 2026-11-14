import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Briefcase, Building2, ExternalLink, FileText, Image, Inbox, KeyRound, LayoutDashboard, LogOut, Menu, Package, Settings, Wrench, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV = [
  { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  { group: 'Leads', items: [
    { to: '/admin/quotes', label: 'Quote Requests', icon: FileText, badge: 'quotes' },
    { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox, badge: 'inquiries' },
  ] },
  { group: 'Content', items: [
    { to: '/admin/services', label: 'Services', icon: Wrench },
    { to: '/admin/industries', label: 'Industries', icon: Building2 },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/projects', label: 'Projects', icon: Briefcase },
    { to: '/admin/media', label: 'Media Library', icon: Image },
  ] },
  { group: 'Website', items: [
    { to: '/admin/settings', label: 'Settings & SEO', icon: Settings },
    { to: '/admin/account', label: 'My Account', icon: KeyRound },
  ] },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({});

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    api.get('/dashboard/stats').then((s) => setBadges({ quotes: s.quotes.new, inquiries: s.inquiries.new })).catch(() => {});
  }, [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="rounded-md bg-white p-1.5"><img src="/brand/logo.jpg" alt="" className="h-8 w-auto" /></span>
        <span className="font-display text-lg font-bold uppercase leading-tight text-white">Admin<br /><span className="text-xs font-semibold tracking-widest text-white/60">Dashboard</span></span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/40">{g.group}</p>
            <ul className="space-y-1">
              {g.items.map(({ to, label, icon: I, end, badge }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors', isActive ? 'bg-brand text-white shadow' : 'text-white/75 hover:bg-white/10 hover:text-white')}>
                    <I className="size-[18px]" aria-hidden /> <span className="flex-1">{label}</span>
                    {badge && badges[badge] > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{badges[badge]}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
        <p className="truncate text-xs text-white/60">{user?.email}</p>
        <button type="button" onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-accent"><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <title>Admin | The Royal Automation</title>
      <meta name="robots" content="noindex,nofollow" />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-navy">
            <button type="button" className="absolute right-3 top-4 p-2 text-white" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
          <button type="button" className="rounded-md border border-line p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <p className="hidden text-sm text-muted md:block">Signed in as <strong className="text-navy">{user?.name}</strong></p>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><ExternalLink className="size-4" /> View Website</a>
        </header>
        <main className="px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
