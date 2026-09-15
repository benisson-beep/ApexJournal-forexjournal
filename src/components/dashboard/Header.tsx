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
    <header className="bg-black/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & Desktop Expand Button when collapsed */}
        <div className="flex items-center gap-2">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {isSidebarCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Action Bar: ONLY Log Trade Button (No shadow) */}
        <div>
          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
