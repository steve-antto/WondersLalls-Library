import Book from '../models/Book.js';
import Borrow from '../models/Borrow.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// @desc    Get all books (with search & filtering)
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
    try {
        const { search, genre, available } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }
        
        if (available === 'true') {
            query.availableCopies = { $gt: 0 };
        }
        
        const books = await Book.find(query).sort({ createdAt: -1 });
        return sendSuccess(res, 'Books retrieved successfully', books);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return sendError(res, 'Book not found', 404);
        }
        return sendSuccess(res, 'Book details retrieved successfully', book);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
export const createBook = async (req, res, next) => {
    try {
        const { title, author, isbn, genre, totalCopies, shelfLocation, publishedYear } = req.body;
        
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return sendError(res, 'A book with this ISBN already exists', 400);
        }
        
        let imagePath = '';
        if (req.file) {
            imagePath = `/uploads/book-images/${req.file.filename}`;
        }
        
        const book = await Book.create({
            title,
            author,
            isbn,
            genre,
            totalCopies,
            availableCopies: totalCopies, // Initialize availability
            shelfLocation,
            publishedYear,
            image: imagePath
        });
        
        return sendSuccess(res, 'Book added to catalog successfully', book, 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
export const updateBook = async (req, res, next) => {
    try {
        const { title, author, isbn, genre, totalCopies, shelfLocation, publishedYear } = req.body;
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            return sendError(res, 'Book not found', 404);
        }
        
        if (isbn && isbn !== book.isbn) {
            const existingBook = await Book.findOne({ isbn });
            if (existingBook) {
                return sendError(res, 'A book with this ISBN already exists', 400);
            }
            book.isbn = isbn;
        }
        
        if (title) book.title = title;
        if (author) book.author = author;
        if (genre) book.genre = genre;
        if (shelfLocation) book.shelfLocation = shelfLocation;
        if (publishedYear) book.publishedYear = publishedYear;
        
        if (totalCopies !== undefined) {
            const parsedTotal = parseInt(totalCopies, 10);
            // Calculate new availability (totalCopies change shouldn't compromise currently borrowed books count)
            const borrowedCount = book.totalCopies - book.availableCopies;
            if (parsedTotal < borrowedCount) {
                return sendError(res, `Cannot reduce total copies below active borrowed count (${borrowedCount})`, 400);
            }
            book.totalCopies = parsedTotal;
            book.availableCopies = parsedTotal - borrowedCount;
        }
        
        if (req.file) {
            // Delete old cover image if it exists
            if (book.image) {
                const oldPath = path.join(process.cwd(), book.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            book.image = `/uploads/book-images/${req.file.filename}`;
        }
        
        const updatedBook = await book.save();
        return sendSuccess(res, 'Book updated successfully', updatedBook);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin/Librarian)
export const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return sendError(res, 'Book not found', 404);
        }
        
        // Assert no active borrowings exist for this book
        const activeBorrows = await Borrow.findOne({ book: book._id, status: { $in: ['BORROWED', 'OVERDUE'] } });
        if (activeBorrows) {
            return sendError(res, 'Cannot delete book as there are active borrowings associated with it', 400);
        }
        
        // Delete image asset if exists
        if (book.image) {
            const imgPath = path.join(process.cwd(), book.image);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }
        
        await Book.findByIdAndDelete(req.params.id);
        return sendSuccess(res, 'Book deleted from catalog successfully');
    } catch (error) {
        next(error);
    }
};

// Multer Storage Setup
const uploadDir = 'uploads/book-images/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only image files are allowed.'), false);
    }
};

export const uploadBookImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});
