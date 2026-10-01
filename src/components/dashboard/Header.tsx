'use client';

import React from 'react';
import {
  Menu,
  PanelLeftOpen,
  Upload,
  Calendar,
  Plus,
} from 'lucide-react';
import { DashboardTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeTab: DashboardTab;
  onSelectTab?: (tab: DashboardTab) => void;
  accountsCount?: number;
  selectedDateStr: string | null;
  onClearDateFilter: () => void;
  onOpenImportModal: () => void;
  onOpenNewTrade?: () => void;
}

const PAGE_TITLES: Record<DashboardTab, string> = {
  OVERVIEW: 'Dashboard Overview',
  ACCOUNTS: 'Trading Accounts',
  LOG: 'Trade Journal',
  CALENDAR: 'P&L Calendar',
  NEWS: 'Economic Calendar',
  PSYCHOLOGY: 'Edge & Psychology',
  PROFILE: 'Trader Profile',
  SETTINGS: 'Settings',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
  activeTab,
  selectedDateStr,
  onClearDateFilter,
  onOpenImportModal,
  onOpenNewTrade,
}) => {
  return (
    <header className="bg-[#0D0D0F]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5 border-b border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 min-w-0">
        {/* Left Side: Mobile Menu Button & Desktop Expand Button when collapsed + Page Title */}
        <div className="flex items-center gap-3 shrink-0">
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

          <h1 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
            {PAGE_TITLES[activeTab] || 'Dashboard'}
          </h1>
        </div>

        {/* Right Side: Date Filter, Import CSV, Month Selector & Log Trade Button */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedDateStr && (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mr-1 bg-[#131317] border border-white/[0.06] px-2.5 py-1.5 rounded-md">
              <span>
                Filter: <strong className="text-emerald-400">{selectedDateStr}</strong>
              </span>
              <button
                onClick={onClearDateFilter}
                className="text-[11px] underline text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#131317] hover:bg-[#18181E] border border-white/[0.06] hover:border-white/[0.12] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-[#131317] border border-white/[0.06] text-xs font-mono text-slate-400 px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          {onOpenNewTrade && (
            <button
              onClick={onOpenNewTrade}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-900/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Trade</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
