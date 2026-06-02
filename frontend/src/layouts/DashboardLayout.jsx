import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar  from '../components/Navbar';

// Main dashboard layout with sidebar + navbar + content area
export default function DashboardLayout({ children }) {
  // Controls mobile sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* ── Sidebar ── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content with responsive padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile overlay (behind sidebar) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}