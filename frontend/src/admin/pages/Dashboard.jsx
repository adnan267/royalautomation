import { Link } from 'react-router';
import { ArrowRight, Briefcase, Building2, FileText, Image, Inbox, Package, Wrench } from 'lucide-react';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/utils';
import { Alert } from '@/components/ui/Feedback';
import { useSite } from '@/context/SiteContext';
import { PageTitle, StatusPill } from '../components/ui';

function Stat({ icon: I, label, value, to, tone = 'brand' }) {
  const tones = { brand: 'bg-brand-50 text-brand', red: 'bg-accent-50 text-accent', navy: 'bg-slate-100 text-navy' };
  return (
    <Link to={to} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className={`grid size-12 place-items-center rounded-lg ${tones[tone]}`}><I className="size-6" /></span>
      <span className="flex-1"><span className="block text-sm text-muted">{label}</span><span className="font-display text-3xl font-extrabold text-navy">{value ?? '—'}</span></span>
      <ArrowRight className="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}

export default function Dashboard() {
  const { data, error } = useFetch('/dashboard/stats');
  const { settings } = useSite();
  const missing = [
    !settings.contact?.phone && 'phone number',
    !settings.contact?.email && 'email address',
    !settings.contact?.whatsapp && 'WhatsApp number',
    !settings.seo?.siteUrl && 'website URL (SEO)',
  ].filter(Boolean);

  return (
    <>
      <PageTitle title="Dashboard" description="Overview of leads and website content." />
      {error && <Alert className="mb-6">{error.message}</Alert>}
      {missing.length > 0 && (
        <Alert tone="info" className="mb-6">
          <strong>Finish setting up your website:</strong> add your {missing.join(', ')} in <Link to="/admin/settings" className="-my-1 inline-block py-1 font-semibold underline">Settings</Link>. Until then, contact buttons point visitors to the contact form.
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FileText} label="New quote requests" value={data?.quotes.new} to="/admin/quotes" tone="red" />
        <Stat icon={FileText} label="Total quote requests" value={data?.quotes.total} to="/admin/quotes" />
        <Stat icon={Inbox} label="New inquiries" value={data?.inquiries.new} to="/admin/inquiries" tone="red" />
        <Stat icon={Inbox} label="Total inquiries" value={data?.inquiries.total} to="/admin/inquiries" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={Wrench} label="Services" value={data?.content.services} to="/admin/services" tone="navy" />
        <Stat icon={Building2} label="Industries" value={data?.content.industries} to="/admin/industries" tone="navy" />
        <Stat icon={Package} label="Products" value={data?.content.products} to="/admin/products" tone="navy" />
        <Stat icon={Briefcase} label="Projects" value={data?.content.projects} to="/admin/projects" tone="navy" />
        <Stat icon={Image} label="Images" value={data?.content.media} to="/admin/media" tone="navy" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {[
          { title: 'Latest Quote Requests', to: '/admin/quotes', rows: data?.latestQuotes || [], name: (r) => r.fullName, sub: (r) => r.service || r.companyName },
          { title: 'Latest Inquiries', to: '/admin/inquiries', rows: data?.latestInquiries || [], name: (r) => r.name, sub: (r) => r.subject },
        ].map((box) => (
          <section key={box.title} className="card overflow-hidden">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-xl font-bold uppercase text-navy">{box.title}</h2>
              <Link to={box.to} className="-my-2 py-2 text-sm font-semibold text-brand hover:underline">View all</Link>
            </header>
            {box.rows.length === 0 ? (
              <p className="px-5 py-10 text-center text-muted">Nothing here yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {box.rows.map((r) => (
                  <li key={r._id}>
                    <Link to={`${box.to}?open=${r._id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-navy">{box.name(r)}</span>
                        <span className="block truncate text-sm text-muted">{r.reference} · {box.sub(r) || '—'}</span>
                      </span>
                      <span className="hidden text-sm text-muted sm:block">{formatDate(r.createdAt)}</span>
                      <StatusPill status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
