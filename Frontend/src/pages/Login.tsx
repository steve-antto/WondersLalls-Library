import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User, 
  Hash, 
  Phone, 
  CreditCard, 
  GraduationCap, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific states
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [libraryCardNumber, setLibraryCardNumber] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // Wait for Auth state update, then redirect
      navigate('/portal');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        phoneNumber: phoneNumber.trim(),
        libraryCardNumber: libraryCardNumber.trim()
      });
      // Switch back to login
      setIsRegister(false);
      setPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden select-none bg-radial-gradient">
      
      {/* Decorative cosmic blurs */}
      <div className="absolute top-[15%] left-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 blur-[120px] opacity-35 pointer-events-none" />
      <div className="absolute bottom-[15%] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 blur-[140px] opacity-25 pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-lg z-10 space-y-8 animate-fade-in">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <span className="font-heading font-black text-4xl tracking-widest bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
              WondersLalls
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            WondersLalls College Library Workspace
          </p>
        </div>

        {/* Dual Card Sheets */}
        <div className="glass bg-slate-900/40 border border-white/8 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl relative">
          
          {!isRegister ? (
            /* Login Sheet */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-2xl text-white">Welcome Back</h2>
                <p className="text-xs text-slate-400">Access your academic library account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@library.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:shadow-[0_0_8px_rgba(99,102,241,0.25)] transition-all font-sans text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:shadow-[0_0_8px_rgba(99,102,241,0.25)] transition-all font-sans text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                New student?{' '}
                <button
                  onClick={() => {
                    setIsRegister(true);
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-cyan-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          ) : (
            /* Registration Sheet */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="font-heading font-bold text-2xl text-white">Register Student</h2>
                <p className="text-xs text-slate-400">Join the library workspace network</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@student.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" />
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" />
                      Roll Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ROLL-101"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      Library Card #
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CARD-9999"
                      value={libraryCardNumber}
                      onChange={(e) => setLibraryCardNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  Create Account
                  <Check className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  onClick={() => {
                    setIsRegister(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-cyan-400 font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
