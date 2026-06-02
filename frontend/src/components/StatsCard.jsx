import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated statistics card for dashboard overview
 */
export default function StatsCard({ icon: Icon, label, value, change, color, delay = 0 }) {
  const colorMap = {
    brand:   { bg: 'bg-brand-600/15',   text: 'text-brand-400',   glow: 'shadow-brand' },
    cyan:    { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    glow: '' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: '' },
    amber:   { bg: 'bg-amber-500/15',   text: 'text-amber-400',   glow: '' },
    violet:  { bg: 'bg-violet-500/15',  text: 'text-violet-400',  glow: '' },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="glass-card p-5 group hover:-translate-y-0.5 transition-transform duration-200"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-4 ${c.glow} transition-shadow`}>
        <Icon className={`${c.text} text-lg`} />
      </div>

      {/* Value */}
      <p className="stat-value text-2xl sm:text-3xl mb-1">{value ?? '—'}</p>

      {/* Label */}
      <p className="text-slate-500 text-xs font-body uppercase tracking-wider">{label}</p>

      {/* Change indicator */}
      {change != null && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-display font-medium ${
          change >= 0 ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          <span>{change >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}% vs last week</span>
        </div>
      )}
    </motion.div>
  );
}