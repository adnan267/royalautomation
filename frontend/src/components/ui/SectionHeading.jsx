import { cn } from '@/lib/utils';
import Highlight from './Highlight';
import Reveal from './Reveal';

/** Centered uppercase heading with side rules, matching the brand reference. */
export default function SectionHeading({ title, subtitle, eyebrow, align = 'center', light = false, as: Tag = 'h2', className }) {
  const center = align === 'center';
  return (
    <Reveal className={cn(center ? 'text-center mx-auto' : '', 'max-w-5xl', className)}>
      {eyebrow && <p className={cn('eyebrow mb-3', light && 'text-white/80')}>{eyebrow}</p>}
      <div className={cn('flex items-center gap-5', center ? 'justify-center' : '')}>
        {center && <span className={cn('hidden sm:block h-px w-12 md:w-24 shrink-0', light ? 'bg-white/40' : 'bg-brand/60')} />}
        <Tag className={cn('font-display font-extrabold uppercase text-3xl sm:text-4xl md:text-[2.75rem]', light ? 'text-white' : 'text-navy')}>
          <Highlight text={title} className={light ? 'text-[#ff6b74]' : 'text-accent'} />
        </Tag>
        {center && <span className={cn('hidden sm:block h-px w-12 md:w-24 shrink-0', light ? 'bg-white/40' : 'bg-brand/60')} />}
      </div>
      {subtitle && <p className={cn('mt-4 text-lg', light ? 'text-white/80' : 'text-muted')}>{subtitle}</p>}
    </Reveal>
  );
}
