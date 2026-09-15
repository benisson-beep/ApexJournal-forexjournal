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
      badge: 'AI',
    },
  ];

  const configItems = [
    {
      id: 'PROFILE' as DashboardTab,
      label: 'Trader Profile',
      icon: User,
      badge: 'PRO',
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
      {/* Top section: Logo, Expand/Collapse Toggle & Nav Items */}
      <div className="space-y-4">
        {/* Brand Header with Expand / Collapse Button */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-4`}>
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="ApexJournal Home"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs tracking-tighter group-hover:scale-105 transition-transform shrink-0">
              AJ
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-100 text-sm tracking-tight font-sans">
                    Apex<span className="text-emerald-400">Journal</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Institutional Terminal</p>
              </div>
            )}
          </Link>

          {/* Desktop Expand / Collapse Button directly in top row */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button: New Trade (No shadow) */}
        <div className="px-3">
          <button
            onClick={() => {
              onOpenNewTrade();
              if (isMobileOpen) onCloseMobile();
            }}
            className={`w-full flex items-center justify-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Log New Trade"
          >
            <Plus className="w-4 h-4 stroke-[2.8] shrink-0" />
            {!isCollapsed && <span className="truncate">Log Trade</span>}
          </button>
        </div>

        {/* Navigation Group 1: Workspace */}
        <div className="px-3 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-emerald-500/25 text-emerald-300'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Webhook Quick Status */}
        <div className="px-3 pt-2">
          <button
            onClick={() => {
              onOpenSyncModal();
              if (isMobileOpen) onCloseMobile();
            }}
            title="MT4/MT5 Webhook Sync"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs bg-[#080c14] border border-white/10 hover:border-emerald-500/30 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="text-[11px] font-semibold text-slate-300">MT5 Webhook</p>
                <p className="text-[9px] text-emerald-400 font-mono">Live Sync Active</p>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom section: Collapse Toggle Button */}
      <div className="p-3">
        <button
          onClick={onToggleCollapse}
          className={`hidden md:flex w-full items-center gap-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft className="w-4 h-4 shrink-0" />
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#080b11] border-r border-white/10 z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:block sticky top-0 h-screen bg-[#080b11] border-r border-white/10 transition-all duration-200 shrink-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
