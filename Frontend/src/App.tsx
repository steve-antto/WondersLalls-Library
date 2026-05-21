import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import CinematicBackground from './components/CinematicBackground';
import Login from './pages/Login';
import Portal from './pages/Portal';
import './App.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/portal" replace /> : <>{children}</>;
}

function AppContent() {
  return (
    <div className="relative min-h-screen">
      {/* Global Cinematic Particle Background */}
      <CinematicBackground />

      {/* Main router endpoints */}
      <Routes>
        <Route 
          path="/login" 
          element={
            <LoginGuard>
              <Login />
            </LoginGuard>
          } 
        />
        <Route 
          path="/portal" 
          element={
            <AuthGuard>
              <Portal />
            </AuthGuard>
          } 
        />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>

      {/* Custom Glow Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'glass bg-slate-900/90 text-white border border-white/10 font-sans font-semibold text-xs py-3 px-4 shadow-xl',
          duration: 3500,
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
