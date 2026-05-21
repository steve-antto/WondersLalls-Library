import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  History, 
  User, 
  Book, 
  Calendar, 
  CheckCircle2, 
  Repeat, 
  CreditCard 
} from 'lucide-react';

interface DropdownStudent {
  _id: string;
  department: string;
  rollNumber: string;
  libraryCardNumber: string;
  user: { name: string; activeStatus: boolean };
}

interface DropdownBook {
  _id: string;
  title: string;
  availableCopies: number;
  shelfLocation: string;
}

interface BorrowRecord {
  _id: string;
  book: { title: string; author: string; isbn: string };
  student: { rollNumber: string; user: { name: string } };
  borrowDate: string;
  dueDate: string;
  status: string;
  fineDetails?: { _id: string; amount: number; status: string };
}

export default function CirculationView() {
  const [dropdownStudents, setDropdownStudents] = useState<DropdownStudent[]>([]);
  const [dropdownBooks, setDropdownBooks] = useState<DropdownBook[]>([]);
  const [borrowLogs, setBorrowLogs] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Issue state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [durationInDays, setDurationInDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load active borrowings
      const logsRes = await api.get('/borrow/history');
      if (logsRes.data?.success) {
        // filter out already returned items
        const activeLoans = logsRes.data.data.filter(
          (b: any) => b.status === 'BORROWED' || b.status === 'OVERDUE'
        );
        setBorrowLogs(activeLoans);
      }

      // 2. Load dropdown catalogs
      const studentsRes = await api.get('/students');
      if (studentsRes.data?.success) {
        // Only active accounts can borrow
        const activeStuds = studentsRes.data.data.filter(
          (s: any) => s.user?.activeStatus
        );
        setDropdownStudents(activeStuds);
      }

      const booksRes = await api.get('/books');
      if (booksRes.data?.success) {
        // Only books in stock can be borrowed
        const inStockBooks = booksRes.data.data.filter(
          (b: any) => b.availableCopies > 0
        );
        setDropdownBooks(inStockBooks);
      }
    } catch (error: any) {
      console.error('Error fetching circulation datasets:', error);
      toast.error('Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook) {
      toast.error('Please select both a student and a book.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/borrow', {
        studentId: selectedStudent,
        bookId: selectedBook,
        durationInDays
      });

      if (res.data?.success) {
        toast.success('Book issued successfully!');
        setSelectedBook('');
        setSelectedStudent('');
        setDurationInDays(14);
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to issue book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (borrowId: string) => {
    try {
      const res = await api.post(`/borrow/return/${borrowId}`);
      if (res.data?.success) {
        toast.success('Book returned successfully.');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Return transaction failed.');
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      const res = await api.post(`/borrow/pay-fine/${fineId}`);
      if (res.data?.success) {
        toast.success('Outstanding fine settled successfully!');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fine settlement failed.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Column 1: Issue Book Form */}
          <div className="glass bg-slate-900/40 border border-white/5 p-8 rounded-2xl h-fit">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Issue & Borrow Desk
            </h3>
            
            <form onSubmit={handleIssue} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Select Student
                </label>
                <select
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-slate-100 outline-none focus:border-indigo-500 text-sm select"
                >
                  <option value="">-- Choose Student --</option>
                  {dropdownStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.user.name} ({s.rollNumber} - Card: {s.libraryCardNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Book className="w-3.5 h-3.5 text-slate-400" />
                  Select Book
                </label>
                <select
                  required
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-slate-100 outline-none focus:border-indigo-500 text-sm select"
                >
                  <option value="">-- Choose Book --</option>
                  {dropdownBooks.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} (Qty: {b.availableCopies} - Shelf: {b.shelfLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={durationInDays}
                  onChange={(e) => setDurationInDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Borrowing
              </button>
            </form>
          </div>

          {/* Column 2: Active Borrowings & Fines List */}
          <div className="glass bg-slate-900/40 border border-white/5 p-8 rounded-2xl xl:col-span-2">
            <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <History className="w-5 h-5 text-indigo-400" />
              Active Outstanding Loans & Desk Actions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/20">
                    <th className="py-4 px-4">Student</th>
                    <th className="py-4 px-4">Book Details</th>
                    <th className="py-4 px-4">Due Date</th>
                    <th className="py-4 px-4">Fines Due</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Desk Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-sm text-slate-200">
                  {borrowLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                        No outstanding books borrowed at the library desk.
                      </td>
                    </tr>
                  ) : (
                    borrowLogs.map((b) => {
                      const dueStr = new Date(b.dueDate).toLocaleDateString();
                      const fine = b.fineDetails?.amount || 0;
                      const hasFine = fine > 0;
                      const isFineUnpaid = b.fineDetails?.status === 'UNPAID';
                      const statusClass = b.status === 'BORROWED' ? 'badge-success' : 'badge-overdue';

                      return (
                        <tr key={b._id} className="hover:bg-white/1 transition-colors">
                          {/* Student */}
                          <td className="py-4 px-4">
                            <strong className="text-white block font-heading">{b.student.user.name}</strong>
                            <span className="text-xs text-slate-400 font-mono">{b.student.rollNumber}</span>
                          </td>

                          {/* Book */}
                          <td className="py-4 px-4">
                            <strong className="text-slate-200 block truncate max-w-[200px]" title={b.book.title}>
                              {b.book.title}
                            </strong>
                            <span className="text-xs text-slate-400 font-mono">ISBN: {b.book.isbn}</span>
                          </td>

                          {/* Due date */}
                          <td className="py-4 px-4 font-mono text-xs">{dueStr}</td>

                          {/* Fine amount */}
                          <td className="py-4 px-4 font-semibold">
                            <span className={hasFine ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                              ₹{fine}
                            </span>
                          </td>

                          {/* Loan Status badge */}
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === 'BORROWED' 
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}>
                              {b.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {hasFine && isFineUnpaid && b.fineDetails && (
                                <button
                                  onClick={() => handlePayFine(b.fineDetails!._id)}
                                  className="btn btn-sm border border-amber-500/30 hover:bg-amber-600 hover:text-white hover:border-transparent text-amber-400 font-heading font-semibold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                  title="Pay Fine amount"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Pay Fine
                                </button>
                              )}
                              <button
                                onClick={() => handleReturn(b._id)}
                                className="btn btn-sm border border-indigo-500/30 hover:bg-indigo-600 hover:text-white hover:border-transparent text-indigo-400 font-heading font-semibold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Repeat className="w-3.5 h-3.5" />
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
