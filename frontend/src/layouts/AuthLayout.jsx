import React from 'react';
import { motion } from 'framer-motion';
import { HiLink } from 'react-icons/hi';

// Layout wrapper for login/signup pages
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-1 flex-col items-center justify-center p-12">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-violet/10 rounded-full blur-3xl" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 text-center max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <HiLink className="text-white text-2xl" />
            </div>
          </div>

          <h1 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Shorten. Track.<br />
            <span className="text-gradient">Dominate.</span>
          </h1>
          <p className="text-slate-400 font-body text-base leading-relaxed mb-10">
            Turn long URLs into powerful short links with real-time analytics,
            custom aliases, and beautiful dashboards.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {['Custom aliases', 'Click analytics', 'QR codes', 'Expiry dates', 'Device stats'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-display font-medium bg-brand-600/15 text-brand-400 border border-brand-500/20">
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-16 left-8 glass-card p-3 flex items-center gap-3 w-52"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-emerald text-sm">↑</span>
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-white">1,284 clicks</p>
            <p className="text-xs text-slate-500">Last 24 hours</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute top-16 right-8 glass-card p-3 flex items-center gap-3 w-48"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-cyan text-sm">🔗</span>
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-white">ln.ks/abc123</p>
            <p className="text-xs text-slate-500">Just created</p>
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <HiLink className="text-white text-base" />
            </div>
            <span className="font-display font-bold text-white text-lg">LinkSnap</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}