import React from 'react';

const VARIANTS = {
  default:  'bg-slate-700/50 text-slate-300 border-slate-600/30',
  success:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
  danger:   'bg-rose-500/15 text-rose-400 border-rose-500/25',
  brand:    'bg-brand-600/15 text-brand-400 border-brand-500/25',
  cyan:     'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
};

/**
 * Status / label badge
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}