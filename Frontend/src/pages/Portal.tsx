import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import DashboardView from './DashboardView';
import BooksView from './BooksView';
import StudentsView from './StudentsView';
import CirculationView from './CirculationView';
import NotificationsView from './NotificationsView';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Portal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Periodically refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data?.success) {
        toast.success('All notifications marked as read.');
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error('Failed to clear notifications.');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView notifications={notifications} onMarkAllRead={handleMarkAllRead} />;
      case 'books':
        return <BooksView />;
      case 'students':
        return <StudentsView />;
      case 'circulation':
        return <CirculationView />;
      case 'notifications':
        return <NotificationsView notifications={notifications} onRefresh={fetchNotifications} />;
      default:
        return <DashboardView notifications={notifications} onMarkAllRead={handleMarkAllRead} />;
    }
  };

  return (
    <div className="flex min-h-screen text-slate-100 font-sans relative overflow-hidden bg-[#06050e]/65">
      {/* Premium ambient decorative cosmic blurs */}
      <div className="absolute top-[5%] left-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-[130px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-[140px] opacity-35 pointer-events-none" />

      {/* Dynamic Glassmorphic Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreadCount={unreadCount} 
      />

      {/* Main Panel Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-y-auto z-10">
        <TopNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          unreadCount={unreadCount} 
        />
        
        <main className="flex-grow p-10 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
