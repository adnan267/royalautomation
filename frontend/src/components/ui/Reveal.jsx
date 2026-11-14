import { motion, useReducedMotion } from 'framer-motion';

/** Subtle fade-up entrance animation when the element scrolls into view. */
export default function Reveal({ children, delay = 0, y = 18, as = 'div', className, ...rest }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </M>
  );
}
