import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { deactivationError, clearDeactivationError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* High-visibility Deactivation Alert Banner */}
        {deactivationError && (
          <div className="bg-rose-700 text-white px-4 py-3 flex items-center justify-between text-xs font-semibold shadow-md z-40 animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-200" />
              <span>{deactivationError}</span>
            </div>
            <button
              onClick={clearDeactivationError}
              className="text-rose-200 hover:text-white p-1 rounded hover:bg-rose-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
