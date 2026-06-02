import React from 'react';
import { motion } from 'framer-motion';

/**
 * Empty state illustration component
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated icon container */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center animate-float">
          {Icon && <Icon className="text-brand-400 text-2xl" />}
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-brand-500/5 blur-xl" />
      </div>

      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>

      {action}
    </motion.div>
  );
}