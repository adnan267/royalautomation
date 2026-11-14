export const cn = (...c) => c.filter(Boolean).join(' ');

/** Strip *highlight* markers for plain-text contexts (title tags, alt text). */
export const plain = (s = '') => String(s).replace(/\*/g, '');

export const digits = (s = '') => String(s).replace(/[^\d+]/g, '');
export const telHref = (phone) => (phone ? `tel:${digits(phone)}` : '');
export const mailHref = (email, subject) => (email ? `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}` : '');
export const waHref = (number, text = '') => {
  const n = String(number || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
};

export const formatDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
      })
    : '';

export const formatBytes = (n = 0) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

export const statusLabel = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
