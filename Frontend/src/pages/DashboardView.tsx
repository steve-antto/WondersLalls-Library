import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Book, 
  Repeat, 
  AlertTriangle, 
  CreditCard, 
  BookOpen, 
  Clock, 
  Bell,
  ChevronRight
} from 'lucide-react';

interface StatsData {
  totalBooks: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalUnpaidFines: number;
}

interface BorrowRecord {
  _id: string;
  book: { title: string; author: string; isbn: string };
  student: { rollNumber: string; user: { name: string } };
  borrowDate: string;
  dueDate: string;
  status: string;
  fineDetails?: { amount: number; status: string };
}

interface DashboardViewProps {
  notifications: any[];
  onMarkAllRead: () => void;
}

export default function DashboardView({ notifications, onMarkAllRead }: DashboardViewProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentBorrows, setRecentBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({
    activeBorrows: 0,
    overdueBorrows: 0,
    outstandingFines: 0
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // 1. Fetch system dashboard stats
          const statsRes = await api.get('/admin/dashboard-stats');
          if (statsRes.data?.success) {
            setStats(statsRes.data.data);
          }

          // 2. Fetch recent transactions
          const borrowsRes = await api.get('/borrow/history');
          if (borrowsRes.data?.success) {
            // Take active/overdue borrows
            const activeLogs = borrowsRes.data.data
              .filter((b: any) => b.status === 'OVERDUE')
              .slice(0, 5);
            setRecentBorrows(activeLogs);
          }
        } else {
          // Student Dashboard
          // 1. Fetch my borrows
          const myBorrowsRes = await api.get('/borrow/my-history');
          if (myBorrowsRes.data?.success) {
            const list = myBorrowsRes.data.data;
            const activeCount = list.filter((b: any) => b.status === 'BORROWED').length;
            const overdueCount = list.filter((b: any) => b.status === 'OVERDUE').length;
            
            // 2. Fetch my fine status from student profile
            const profileRes = await api.get(`/students/${user?._id}`);
            const fines = profileRes.data?.data?.fineAmount || 0;

            setStudentStats({
              activeBorrows: activeCount,
              overdueBorrows: overdueCount,
              outstandingFines: fines
            });

            // Set my active borrowings list
            const currentLoans = list.filter((b: any) => b.status === 'BORROWED' || b.status === 'OVERDUE');
            setRecentBorrows(currentLoans);
          }
        }
      } catch (error: any) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Premium Welcome Header Banner */}
      <div className="glass bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent border border-white/5 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="space-y-2 z-10">
          <h1 className="font-heading font-black text-3xl text-white tracking-tight">
            {getGreeting()}, <span className="bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl font-sans leading-relaxed">
            Welcome to the <span className="text-indigo-300 font-bold">WondersLalls College Library Portal</span>. Search the digital catalog, monitor your loans, and check real-time system alerts below.
          </p>
        </div>
        <div className="flex items-center gap-4 z-10">
          <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Role</span>
            <span className="text-xs font-bold text-indigo-300 tracking-wide uppercase">{user?.role}</span>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Campus</span>
            <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">WondersLalls</span>
          </div>
        </div>
        
        {/* Glow sphere decor */}
        <div className="absolute right-[-10%] top-[-50%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      </div>

      {/* 1. Cinematic KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          /* Admin Stats Cards */
          <>
            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Catalog</p>
                <h3 className="font-heading font-black text-3xl text-white">{stats?.totalBooks || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Book className="w-6 h-6" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Borrowings</p>
                <h3 className="font-heading font-black text-3xl text-white">{stats?.activeBorrowings || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Repeat className="w-6 h-6" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Books</p>
                <h3 className="font-heading font-black text-3xl text-white text-rose-400">{stats?.overdueBorrowings || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outstanding Fines</p>
                <h3 className="font-heading font-black text-3xl text-amber-400">₹{stats?.totalUnpaidFines || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </>
        ) : (
          /* Student Stats Cards */
          <>
            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Currently Borrowed</p>
                <h3 className="font-heading font-black text-3xl text-white">{studentStats.activeBorrows}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue Items</p>
                <h3 className="font-heading font-black text-3xl text-rose-400">{studentStats.overdueBorrows}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal Fine Balance</p>
                <h3 className="font-heading font-black text-3xl text-amber-400">₹{studentStats.outstandingFines}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="glass bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all duration-350 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] group">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Alerts</p>
                <h3 className="font-heading font-black text-3xl text-white">{notifications.filter(n => !n.read).length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. Interactive Data Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active/Overdue Borrowings List */}
        <div className="glass bg-slate-900/40 border border-white/5 p-8 rounded-2xl lg:col-span-2">
          <h3 className="font-heading font-bold text-lg text-white mb-6 border-b border-white/5 pb-4">
            {isAdmin ? 'System Overdue Borrowings' : 'My Active Borrowings'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">{isAdmin ? 'Student' : 'Book Title'}</th>
                  <th className="py-3 px-4">{isAdmin ? 'Book Title' : 'Author'}</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">{isAdmin ? 'Accrued Fine' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 text-sm text-slate-200">
                {recentBorrows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-sans">
                      {isAdmin ? 'No active overdue borrowings found.' : 'You have no active borrowings.'}
                    </td>
                  </tr>
                ) : (
                  recentBorrows.map((b) => {
                    const dueStr = new Date(b.dueDate).toLocaleDateString();
                    const fine = b.fineDetails?.amount || 0;
                    
                    return (
                      <tr key={b._id} className="hover:bg-white/1 transition-colors">
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <div>
                              <strong className="text-white block">{b.student.user.name}</strong>
                              <span className="text-[10px] text-slate-400">{b.student.rollNumber}</span>
                            </div>
                          ) : (
                            <strong className="text-white font-bold">{b.book.title}</strong>
                          )}
                        </td>
                        <td className="py-4 px-4">{isAdmin ? b.book.title : b.book.author}</td>
                        <td className="py-4 px-4 font-mono text-xs">{dueStr}</td>
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <span className="font-semibold text-rose-400">₹{fine}</span>
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === 'BORROWED' 
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}>
                              {b.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Notification List */}
        <div className="glass bg-slate-900/40 border border-white/5 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h3 className="font-heading font-bold text-lg text-white">System Alerts</h3>
            <button
              onClick={onMarkAllRead}
              className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 4).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No new notifications.
              </div>
            ) : (
              notifications.slice(0, 4).map((n) => {
                const dateStr = new Date(n.createdAt).toLocaleDateString();
                const isOverdue = n.type === 'OVERDUE';
                const isSoon = n.type === 'DUE_SOON';
                
                return (
                  <div
                    key={n._id}
                    className={`flex gap-3 p-3.5 rounded-xl border ${
                      !n.read 
                        ? 'bg-cyan-500/5 border-cyan-500/20 text-white' 
                        : 'bg-white/2 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      isOverdue 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : isSoon 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-grow">
                      <p className="text-xs font-medium leading-normal line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
