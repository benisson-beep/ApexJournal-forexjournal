'use client';

import React from 'react';
import { Menu, Plus, PanelLeftOpen } from 'lucide-react';

interface HeaderProps {
  onOpenNewTrade: () => void;
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTrade,
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-[#0D0D0F]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-2.5 border-b border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Desktop Expand Button when collapsed */}
        <div className="flex items-center gap-2">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 -ml-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}

          {isSidebarCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex items-center gap-1.5 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Right Action Bar: Restrained Log Trade Button */}
        <div>
          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
