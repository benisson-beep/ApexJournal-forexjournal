'use client';

import React from 'react';
import { DashboardTab } from './Sidebar';
import {
  Brain,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  ListFilter,
  Menu,
  Newspaper,
  PanelLeftOpen,
  Upload,
  Wallet,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  accountsCount: number;
  selectedDateStr: string | null;
  onClearDateFilter: () => void;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  isSidebarCollapsed,
  onToggleSidebar,
  activeTab,
  onSelectTab,
  accountsCount,
  selectedDateStr,
  onClearDateFilter,
  onOpenImportModal,
}) => {
  return (
    <header className="bg-[#0D0D0F]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5 border-b border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button, Desktop Sidebar Expand Button, & Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-1.5 -ml-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}

          {isSidebarCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex items-center gap-1.5 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer shrink-0"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}

          {/* Workspace Tabs */}
          <div className="flex items-center gap-1 bg-[#131317] border border-white/[0.06] p-1 rounded-md overflow-x-auto max-w-full">
            <button
              onClick={() => onSelectTab('OVERVIEW')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'OVERVIEW'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onSelectTab('ACCOUNTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'ACCOUNTS'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Accounts ({accountsCount})</span>
            </button>

            <button
              onClick={() => onSelectTab('LOG')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'LOG'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Trade Journal</span>
            </button>

            <button
              onClick={() => onSelectTab('CALENDAR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'CALENDAR'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>P&L Calendar</span>
            </button>

            <button
              onClick={() => onSelectTab('NEWS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'NEWS'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Economic Calendar</span>
            </button>

            <button
              onClick={() => onSelectTab('PSYCHOLOGY')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === 'PSYCHOLOGY'
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Edge & Psychology</span>
            </button>
          </div>
        </div>

        {/* Right Side: Date Filter, Import CSV, Date Display */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedDateStr && (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mr-1">
              <span>Date: <strong className="text-emerald-400">{selectedDateStr}</strong></span>
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
            <span>Import CSV</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-[#131317] border border-white/[0.06] text-xs font-mono text-slate-400 px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
