'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenNewTrade: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTrade,
  onOpenMobileMenu,
}) => {
  return (
    <header className="border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Mobile menu trigger (visible only on mobile) */}
        <div>
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right Action Bar: ONLY Log Trade Button */}
        <div>
          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
