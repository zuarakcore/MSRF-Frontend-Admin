import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface LayoutShellProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
  actions?: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  children,
  title,
  breadcrumb,
  actions,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          title={title}
          breadcrumb={breadcrumb}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Optional Page Subheader Action Row */}
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {title}
                  </h1>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
          )}

          {/* Page Body */}
          {children}
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-8 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm mt-auto">
          CRAFTED BY{' '}
          <a
            href="https://www.zuarak.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-extrabold text-slate-800 hover:text-blue-600 transition-colors tracking-wider underline decoration-slate-300 underline-offset-4"
          >
            ZUARAK
          </a>
        </footer>
      </div>
    </div>
  );
};
