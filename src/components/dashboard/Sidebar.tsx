'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ListFilter,
  CalendarDays,
  Brain,
  User,
  Settings,
  Plus,
  X,
  Wallet,
  PanelLeft,
} from 'lucide-react';
import { TradingAccount } from '../../types/trade';

export type DashboardTab = 'OVERVIEW' | 'LOG' | 'CALENDAR' | 'PSYCHOLOGY' | 'ACCOUNTS' | 'PROFILE' | 'SETTINGS';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewTrade: () => void;
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
      label: 'Settings & Risk',
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
                AJ
              </span>
            ) : (
              <div>
                <span className="font-heading font-bold text-slate-100 text-base tracking-tight">
                  Apex<span className="text-slate-400 font-normal">Journal</span>
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

        {/* Quick Action Button: New Trade */}
        <div className="px-3">
          <button
            onClick={() => {
              onOpenNewTrade();
              if (isMobileOpen) onCloseMobile();
            }}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs py-2 rounded-md transition-colors cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Log New Trade"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="truncate">Log Trade</span>}
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
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 text-left flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300">MT5 Sync</span>
                <span className="text-[10px] text-slate-500 font-mono">Connected</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom section: Collapse Toggle Button */}
      <div className="p-3">
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
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0D0D0F] border-r border-white/[0.06] z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-[#0D0D0F] border-r border-white/[0.06] transition-all duration-200 shrink-0 z-30 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
