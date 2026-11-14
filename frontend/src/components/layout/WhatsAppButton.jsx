import { useSite } from '@/context/SiteContext';
import { waHref } from '@/lib/utils';

export default function WhatsAppButton() {
  const { settings } = useSite();
  const { contact = {}, website = {} } = settings;
  const href = waHref(contact.whatsapp, contact.whatsappMessage);
  if (!href || website.showWhatsAppButton === false) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      className="group fixed right-4 z-30 flex items-center gap-2 rounded-full bg-[#25D366] p-3 sm:right-5 sm:p-3.5 text-white shadow-lift transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="size-6 sm:size-7" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z" />
      </svg>
      <span className="hidden pr-1 font-semibold sm:group-hover:inline">WhatsApp</span>
    </a>
  );
}
