import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiMenu, HiBell } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

// Page title map
const PAGE_TITLES = {
  '/dashboard':  { title: 'Dashboard',  subtitle: 'Manage and track all your short links' },
  '/analytics':  { title: 'Analytics',  subtitle: 'Deep dive into your link performance' },
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { user }  = useAuth();

  // Find best matching page title
  const pageInfo = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || { title: 'LinkSnap', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: menu + page title */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <HiMenu className="text-xl" />
          </button>

          <div>
            <h2 className="font-display font-bold text-white text-base sm:text-lg leading-tight">
              {pageInfo.title}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">{pageInfo.subtitle}</p>
          </div>
        </div>

        {/* Right: notification bell + avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification bell (decorative) */}
          <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative">
            <HiBell className="text-xl" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-400" />
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-display font-bold cursor-pointer">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}