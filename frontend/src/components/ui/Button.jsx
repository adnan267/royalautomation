import { Link } from 'react-router';
import { cn } from '@/lib/utils';

/** Renders a router Link, external anchor or <button> with brand button styling. */
export default function Button({ to, href, variant = 'red', size, className, children, ...rest }) {
  const cls = cn('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', className);
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

/** Internal links use the router; http(s)/tel/mailto links use <a>. */
export function SmartLink({ to = '', children, ...rest }) {
  if (/^(https?:|tel:|mailto:)/.test(to)) {
    const ext = /^https?:/.test(to);
    return <a href={to} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}</a>;
  }
  return <Link to={to} {...rest}>{children}</Link>;
}
