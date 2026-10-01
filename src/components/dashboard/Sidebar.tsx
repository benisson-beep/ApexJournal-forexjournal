'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListFilter,
  CalendarDays,
  Brain,
  User,
  Settings,
  X,
  Wallet,
  PanelLeft,
  Newspaper,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TradingAccount } from '../../types/trade';

export type DashboardTab = 'OVERVIEW' | 'LOG' | 'CALENDAR' | 'NEWS' | 'PSYCHOLOGY' | 'ACCOUNTS' | 'PROFILE' | 'SETTINGS';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewTrade?: () => void;
  onOpenSyncModal: () => void;
  tradeCount?: number;
  accounts?: TradingAccount[];
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenNewTrade,
  onOpenSyncModal,
  tradeCount = 0,
  accounts = [],
  selectedAccountId,
  onSelectAccount,
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Trader';
  const displayEmail = user?.email || 'Authenticated User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TR';

  const navItems = [
    {
      id: 'OVERVIEW' as DashboardTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'ACCOUNTS' as DashboardTab,
      label: 'Accounts',
      icon: Wallet,
      badge: accounts.length > 0 ? accounts.length.toString() : null,
    },
    {
      id: 'LOG' as DashboardTab,
      label: 'Trade Journal',
      icon: ListFilter,
      badge: tradeCount > 0 ? tradeCount.toString() : null,
    },
    {
      id: 'CALENDAR' as DashboardTab,
      label: 'P&L Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'NEWS' as DashboardTab,
      label: 'Economic Calendar',
      icon: Newspaper,
      badge: null,
    },
    {
      id: 'PSYCHOLOGY' as DashboardTab,
      label: 'Edge & Psychology',
      icon: Brain,
      badge: null,
    },
  ];

  const configItems = [
    {
      id: 'PROFILE' as DashboardTab,
      label: 'Trader Profile',
      icon: User,
      badge: null,
    },
    {
      id: 'SETTINGS' as DashboardTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleItemClick = (id: DashboardTab) => {
    onSelectTab(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Top section: Wordmark Logo, Expand/Collapse Toggle & Nav Items */}
      <div className="space-y-4">
        {/* Brand Header with Typographic Wordmark */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-4`}>
          <Link
            href="/"
            className="group cursor-pointer block"
            title="ApexJournal Home"
          >
            {isCollapsed ? (
              <span className="font-heading font-bold text-slate-100 text-base tracking-tight">
                A<span className="text-red-500">J</span>
              </span>
            ) : (
              <div>
                <span className="font-heading font-bold text-slate-100 text-base tracking-tight">
                  Apex<span className="text-red-500 font-semibold">Journal</span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
                  Institutional Terminal
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Expand / Collapse Button directly in top row */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Group 1: Workspace */}
        <div className="px-3 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Workspace
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} strokeWidth={1.5} />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Group 2: Management */}
        <div className="px-3 space-y-1 pt-2">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Account & Settings
            </p>
          )}
          {configItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} strokeWidth={1.5} />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Webhook Status: Small text with dot indicator */}
        <div className="px-3 pt-2">
          <button
            onClick={() => {
              onOpenSyncModal();
              if (isMobileOpen) onCloseMobile();
            }}
            title="MT4/MT5 Webhook Sync"
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs bg-[#131317] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                accounts.find((a) => a.id === selectedAccountId)?.syncEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            {!isCollapsed && (
              <div className="flex-1 text-left flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300">EA Webhook</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {accounts.find((a) => a.id === selectedAccountId)?.syncEnabled ? 'Active' : 'Offline'}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom section: User Profile Card, Logout & Collapse Toggle */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        {/* User Identity & Logout Button */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div
              className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs font-heading"
              title={`${displayName} (${displayEmail})`}
            >
              {initials}
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="bg-[#131317] border border-white/[0.06] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs font-heading shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-slate-200 block truncate font-heading">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">
                  {displayEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`hidden md:flex w-full items-center gap-2 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] text-xs transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : 'px-2.5'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-[11px] font-medium">Collapse Menu</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-black border-r border-white/[0.08] z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-black border-r border-white/[0.08] transition-all duration-200 shrink-0 z-30 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
