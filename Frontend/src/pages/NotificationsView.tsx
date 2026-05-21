import React from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Bell, BellOff, Check } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsViewProps {
  notifications: Notification[];
  onRefresh: () => void;
}

export default function NotificationsView({ notifications, onRefresh }: NotificationsViewProps) {
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data?.success) {
        toast.success('Notification marked as read.');
        onRefresh();
      }
    } catch (error: any) {
      toast.error('Failed to update notification status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data?.success) {
        toast.success('All notifications marked as read.');
        onRefresh();
      }
    } catch (error: any) {
      toast.error('Failed to update notifications status.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="glass bg-slate-900/40 border border-white/5 p-8 rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notifications Inbox
          </h3>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-sm border border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:border-transparent text-indigo-400 font-heading font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-sans space-y-3">
              <BellOff className="w-12 h-12 text-slate-500 mx-auto" />
              <p>Your notifications inbox is completely empty.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const dateStr = new Date(n.createdAt).toLocaleString();
              const isOverdue = n.type === 'OVERDUE';
              const isSoon = n.type === 'DUE_SOON';
              
              return (
                <div
                  key={n._id}
                  className={`flex items-start justify-between gap-4 p-5 rounded-xl border ${
                    !n.read 
                      ? 'bg-cyan-500/5 border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.05)]' 
                      : 'bg-white/2 border-white/5'
                  } transition-all duration-300 hover:border-white/10`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      isOverdue 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : isSoon 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-sm text-white capitalize">
                        {n.type.replace('_', ' ')} Warning
                      </h4>
                      <p className="text-slate-300 text-xs leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">{dateStr}</span>
                    </div>
                  </div>
                  
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="btn btn-sm border border-white/8 hover:bg-white/5 text-slate-300 font-heading font-semibold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
