import React from 'react';
import { motion } from 'framer-motion';

/**
 * Glassmorphism card component
 */
export default function Card({
  children,
  className = '',
  animate = false,
  delay = 0,
  hover = false,
  padding = true,
  ...props
}) {
  const classes = `glass-card ${padding ? 'p-5 sm:p-6' : ''} ${
    hover ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-brand cursor-pointer' : ''
  } ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        className={classes}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}