import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-farmer/20 border-t-farmer rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[var(--text-muted)]">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Desktop Sidebar (hidden on mobile, visible on md screens and up) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Slide-out Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar menu drawer container */}
          <div className="relative flex flex-col w-[260px] h-full shadow-2xl transition-transform duration-300 transform translate-x-0">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content wrapper: ml-0 on mobile, ml-[260px] on md screens and up */}
      <div className="flex-1 ml-0 md:ml-[260px] flex flex-col min-w-0">
        <Topbar onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};