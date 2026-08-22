'use client';
import { motion } from 'framer-motion';

export function FadeIn({ children, delay = 0, className = '', zoom = false }: { children: React.ReactNode, delay?: number, className?: string, zoom?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: zoom ? 0.95 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
