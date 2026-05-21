import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Search, Power, Mail, GraduationCap, Hash, Phone, ShieldCheck } from 'lucide-react';

interface Student {
  _id: string;
  department: string;
  rollNumber: string;
  phoneNumber: string;
  libraryCardNumber: string;
  fineAmount: number;
  user: {
    _id: string;
    name: string;
    email: string;
    activeStatus: boolean;
  };
}

export default function StudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (error: any) {
      console.error('Error loading students directory:', error);
      toast.error('Failed to load students directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleToggleStatus = async (studentId: string, activeStatus: boolean) => {
    try {
      const res = await api.put(`/students/${studentId}`, {
        activeStatus: !activeStatus
      });
      if (res.data?.success) {
        toast.success('Student account status updated!');
        loadStudents();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle account status.');
    }
  };

  const filteredStudents = students.filter((s) => 
    s.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    s.libraryCardNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search and Action Desk */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search students by name, email, roll or card..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-950/40 text-slate-100 placeholder-slate-400 border border-white/5 rounded-xl outline-none focus:border-indigo-500 focus:shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all font-sans text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[30vh]">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm font-sans bg-slate-900/10 border border-white/3 rounded-2xl">
          No student records found matching the query.
        </div>
      ) : (
        /* Student Directory Grid/Table */
        <div className="glass bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/20">
                  <th className="py-4 px-6">Library Card</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Dept / Roll #</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Fine Balance</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 text-sm text-slate-200">
                {filteredStudents.map((s) => {
                  const isActive = s.user?.activeStatus;
                  return (
                    <tr key={s._id} className="hover:bg-white/1 transition-colors">
                      {/* Library Card */}
                      <td className="py-5 px-6 font-mono text-xs font-semibold text-cyan-400">
                        {s.libraryCardNumber}
                      </td>

                      {/* Name Details */}
                      <td className="py-5 px-6">
                        <strong className="text-white block font-heading">{s.user?.name}</strong>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {s.user?.email}
                        </span>
                      </td>

                      {/* Department and Roll */}
                      <td className="py-5 px-6 space-y-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {s.department}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Hash className="w-3.5 h-3.5 text-slate-500" />
                          {s.rollNumber}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-5 px-6">
                        <span className="text-xs flex items-center gap-1 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {s.phoneNumber}
                        </span>
                      </td>

                      {/* Fines */}
                      <td className="py-5 px-6 font-semibold">
                        <span className={s.fineAmount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          ₹{s.fineAmount}
                        </span>
                      </td>

                      {/* Account status */}
                      <td className="py-5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(s._id, isActive)}
                          className={`btn btn-sm border px-3 py-1.5 rounded-lg font-heading font-semibold text-xs flex items-center gap-1.5 ml-auto cursor-pointer ${
                            isActive
                              ? 'border-rose-500/30 hover:bg-rose-600 hover:border-transparent text-rose-400 hover:text-white'
                              : 'border-emerald-500/30 hover:bg-emerald-600 hover:border-transparent text-emerald-400 hover:text-white'
                          } transition-all`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
