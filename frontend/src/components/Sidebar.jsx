import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLink, HiHome, HiChartBar, HiLogout, HiX } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

// Navigation items config
const NAV_ITEMS = [
  { label: 'Dashboard',  icon: HiHome,     path: '/dashboard' }, 
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="h-full flex flex-col bg-surface-1 border-r border-white/[0.06]">
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
            <HiLink className="text-white text-base" />
          </div>
          <span className="font-display font-bold text-white text-lg">LinkSnap</span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <HiX className="text-lg" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-display font-semibold uppercase tracking-widest text-slate-600">
          Main
        </p>
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className={`text-lg flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User profile + Logout ── */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2 bg-white/[0.03]">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 text-white text-xs font-display font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-medium text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="nav-link w-full text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <HiLogout className="text-lg flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (always visible) */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (slide in from left) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-40 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}