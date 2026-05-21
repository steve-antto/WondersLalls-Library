import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Book, 
  Users, 
  Repeat, 
  Bell, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, unreadCount }: SidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const shortName = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const isAdmin = user.role === 'ADMIN' || user.role === 'LIBRARIAN';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'books', label: 'Books Catalog', icon: Book, adminOnly: false },
    { id: 'students', label: 'Student Directory', icon: Users, adminOnly: true },
    { id: 'circulation', label: 'Circulation Desk', icon: Repeat, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, adminOnly: false, badge: unreadCount },
  ];

  return (
    <aside className="h-screen sticky top-0 left-0 bg-slate-900/40 border-r border-white/8 backdrop-blur-xl flex flex-col p-6 w-[280px] z-40 transition-all duration-350 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <BookOpen className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
        <span className="font-heading font-black text-2xl tracking-wider bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
          WondersLalls
        </span>
      </div>

      {/* User Info Badge */}
      <div className="flex items-center gap-4 bg-white/3 border border-white/5 p-4 rounded-xl mb-8">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-heading font-bold text-base text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          {shortName}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-heading font-bold text-sm text-white truncate" title={user.name}>
            {user.name}
          </h4>
          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
            isAdmin 
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
          }`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-grow">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-lg font-medium text-sm transition-all duration-300 border-l-3 group ${
                    isActive
                      ? 'bg-indigo-500/15 text-white border-indigo-500'
                      : 'text-slate-400 border-transparent hover:text-white hover:bg-white/4'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:scale-105'
                  }`} />
                  <span className="flex-grow text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer Log out */}
      <div className="pt-6 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-rose-500/30 text-rose-400 font-heading font-semibold text-sm rounded-lg bg-transparent hover:bg-rose-500 hover:text-white hover:border-transparent transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
