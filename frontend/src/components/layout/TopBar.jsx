import { Link } from 'react-router';
import { Mail, Phone, Settings } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { mailHref, telHref } from '@/lib/utils';

export default function TopBar() {
  const { settings } = useSite();
  const { contact = {}, home = {}, website = {} } = settings;
  if (website.showTopBar === false) return null;
  const phone = telHref(contact.phone);
  const email = mailHref(contact.email);

  const item = 'inline-flex h-10 items-center gap-2 px-1 hover:text-white transition-colors';
  return (
    <div className="bg-navy text-[13px] text-white/85">
      <div className="container-x flex h-10 items-center justify-between gap-4">
        <p className="flex min-w-0 items-center gap-2 truncate font-medium">
          <Settings className="size-4 shrink-0 text-white" aria-hidden />
          <span className="truncate">{home.topBarText}</span>
        </p>
        <div className="flex shrink-0 items-center gap-4 sm:gap-5">
          {phone ? (
            <a href={phone} className={item}><Phone className="size-4" aria-hidden /><span className="hidden sm:inline">{contact.phoneDisplay || 'Call Our Team'}</span><span className="sm:hidden">Call</span></a>
          ) : (
            <Link to="/contact" className={item}><Phone className="size-4" aria-hidden /><span className="hidden sm:inline">Call Our Team</span><span className="sm:hidden">Call</span></Link>
          )}
          <span className="h-4 w-px bg-white/25" aria-hidden />
          {email ? (
            <a href={email} className={item}><Mail className="size-4" aria-hidden /><span className="hidden sm:inline">Email Us</span><span className="sm:hidden">Email</span></a>
          ) : (
            <Link to="/contact" className={item}><Mail className="size-4" aria-hidden /><span className="hidden sm:inline">Email Us</span><span className="sm:hidden">Email</span></Link>
          )}
        </div>
      </div>
    </div>
  );
}
