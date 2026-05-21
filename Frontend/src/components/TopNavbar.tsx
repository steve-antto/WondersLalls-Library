import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';

interface TopNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
}

export default function TopNavbar({ activeTab, setActiveTab, unreadCount }: TopNavbarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const titleMap: Record<string, string> = {
    dashboard: 'Dashboard Summary',
    books: 'Books Catalog',
    students: 'Student Directory',
    circulation: 'Circulation Desk',
    notifications: 'Notifications Inbox',
  };

  return (
    <header className="h-20 w-full bg-slate-900/30 border-b border-white/5 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex flex-col">
        <h2 className="font-heading font-bold text-xl text-white tracking-tight">
          {titleMap[activeTab] || 'WondersLalls Workspace'}
        </h2>
      </div>
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative w-10 h-10 border border-white/8 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer"
          title="Notifications Inbox"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,1)]" />
          )}
        </button>

        {/* User Details */}
        <div className="flex items-center gap-3">
          <span className="font-sans font-semibold text-sm text-slate-300">
            {user.name}
          </span>
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]" />
        </div>
      </div>
    </header>
  );
}
