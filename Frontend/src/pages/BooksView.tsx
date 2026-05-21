import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookCover from '../components/BookCover';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Search, Plus, X, Save, Edit3, Trash2, BookOpen } from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies?: number;
  publishedYear: number;
  image?: string;
}

export default function BooksView() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [shelfLocation, setShelfLocation] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear());
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books');
      if (res.data?.success) {
        setBooks(res.data.data);
      }
    } catch (error: any) {
      console.error('Catalog fetch error:', error);
      toast.error('Failed to retrieve catalog inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const openModal = (book: Book | null = null) => {
    setSelectedBook(book);
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setGenre(book.genre);
      setIsbn(book.isbn);
      setShelfLocation(book.shelfLocation);
      setTotalCopies(book.totalCopies);
      setPublishedYear(book.publishedYear);
    } else {
      setTitle('');
      setAuthor('');
      setGenre('');
      setIsbn('');
      setShelfLocation('');
      setTotalCopies(1);
      setPublishedYear(new Date().getFullYear());
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('author', author.trim());
    formData.append('genre', genre.trim());
    formData.append('isbn', isbn.trim());
    formData.append('shelfLocation', shelfLocation.trim());
    formData.append('totalCopies', totalCopies.toString());
    formData.append('publishedYear', publishedYear.toString());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (selectedBook) {
        // Update Book
        res = await api.put(`/books/${selectedBook._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          toast.success('Book updated successfully!');
        }
      } else {
        // Create Book
        res = await api.post('/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          toast.success('Book created successfully!');
        }
      }
      closeModal();
      loadCatalog();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error occurred while saving.';
      toast.error(msg);
    }
  };

  const handleDelete = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${bookTitle}" from inventory?`)) return;

    try {
      const res = await api.delete(`/books/${bookId}`);
      if (res.data?.success) {
        toast.success('Book removed successfully.');
        loadCatalog();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete operation failed.');
    }
  };

  const handleBorrow = async (bookId: string, bookTitle: string) => {
    if (!user?.studentProfile?._id) {
      toast.error('Student profile details not found. Please contact administration.');
      return;
    }

    if (!confirm(`Are you sure you want to borrow "${bookTitle}" for 14 days?`)) {
      return;
    }

    try {
      const res = await api.post('/borrow', {
        bookId,
        studentId: user.studentProfile._id,
        durationInDays: 14
      });

      if (res.data?.success) {
        toast.success(`"${bookTitle}" borrowed successfully! Enjoy your reading.`);
        loadCatalog();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to borrow book.';
      toast.error(msg);
    }
  };

  const filteredBooks = books.filter((b) => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn.toLowerCase().includes(search.toLowerCase()) ||
    b.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, genre or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-950/40 text-slate-100 placeholder-slate-400 border border-white/5 rounded-xl outline-none focus:border-indigo-500 focus:shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all font-sans text-sm"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="btn btn-primary bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-sm flex items-center gap-2 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[30vh]">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm font-sans bg-slate-900/10 border border-white/3 rounded-2xl">
          No books found in the library catalog catalog matching your query.
        </div>
      ) : (
        /* Books Catalog Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.map((b) => {
            const copiesLeft = b.availableCopies !== undefined ? b.availableCopies : b.totalCopies;
            
            return (
              <div 
                key={b._id} 
                className="glass bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col h-full hover:border-indigo-500/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-350"
              >
                {/* Book Cover */}
                <div className="flex justify-center mb-6">
                  <BookCover title={b.title} author={b.author} image={b.image} size="md" />
                </div>

                {/* Details */}
                <div className="flex flex-col flex-grow space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                      {b.genre}
                    </span>
                    <h4 className="font-heading font-bold text-base text-white leading-snug truncate" title={b.title}>
                      {b.title}
                    </h4>
                    <span className="text-xs text-slate-400 truncate block">by {b.author}</span>
                  </div>

                  <div className="border-t border-white/5 pt-4 text-xs space-y-2 mt-auto">
                    <div className="flex justify-between text-slate-400">
                      <span>ISBN:</span>
                      <span className="text-slate-200 font-mono">{b.isbn}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <span className="text-slate-200">{b.shelfLocation}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Availability:</span>
                      <span className={`font-semibold ${copiesLeft > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {copiesLeft} of {b.totalCopies} left
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                      <button
                        onClick={() => openModal(b)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-white/8 hover:border-white/20 text-slate-300 font-heading font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id, b.title)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-rose-500/20 hover:bg-rose-600 hover:text-white hover:border-transparent text-rose-400 font-heading font-semibold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}

                  {user?.role === 'STUDENT' && (
                    <div className="pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleBorrow(b._id, b.title)}
                        disabled={copiesLeft <= 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent disabled:cursor-not-allowed text-white font-heading font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {copiesLeft > 0 ? 'Borrow Book' : 'Out of Stock'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Modals Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass bg-slate-900/90 border border-white/10 p-8 rounded-2xl w-full max-w-xl shadow-2xl relative animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="font-heading font-bold text-lg text-white">
                {selectedBook ? 'Edit Book Asset' : 'Add New Book Asset'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clean Code"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Author</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert C. Martin"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">ISBN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 978-0132350884"
                    disabled={!!selectedBook}
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Genre</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technology"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Shelf Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf C-12"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Total Copies</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Published Year</label>
                  <input
                    type="number"
                    required
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Upload Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 file:cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Leave blank to automatically generate a majestic canvas-based cover.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-white/8 hover:bg-white/5 text-sm text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
