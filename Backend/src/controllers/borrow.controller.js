import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Borrow from '../models/Borrow.js';
import Fine from '../models/Fine.js';
import { createNotification } from '../services/notification.service.js';
import { addDays, getDifferenceInDays, isPastDue } from '../utils/dateHelper.js';
import { FINE_RATE_PER_DAY } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Borrow a book
// @route   POST /api/borrow
// @access  Private (Admin/Librarian)
export const borrowBook = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { bookId, studentId, durationInDays } = req.body;
        
        // 1. Fetch Student details
        const student = await Student.findById(studentId).populate('user').session(session);
        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Student profile not found', 404);
        }
        
        if (!student.user.activeStatus) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Student account is deactivated', 400);
        }
        
        // 2. Check for outstanding unpaid fines
        if (student.fineAmount > 0) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, `Student has unpaid outstanding fines of amount ${student.fineAmount}. Borrowing blocked.`, 400);
        }
        
        // 3. Check active borrows limit
        const activeBorrowsCount = await Borrow.countDocuments({
            student: studentId,
            status: { $in: ['BORROWED', 'OVERDUE'] }
        }).session(session);
        
        if (activeBorrowsCount >= student.borrowLimit) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, `Student has reached the maximum borrowing limit of ${student.borrowLimit} books.`, 400);
        }
        
        // 4. Fetch Book details
        const book = await Book.findById(bookId).session(session);
        if (!book) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Book not found', 404);
        }
        
        if (book.availableCopies <= 0) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'No copies of this book are currently available in the library', 400);
        }
        
        // 5. Decrement book availability
        book.availableCopies -= 1;
        await book.save({ session });
        
        // 6. Create Borrow transaction
        const borrowDate = new Date();
        const dueDate = addDays(borrowDate, durationInDays);
        
        const borrow = await Borrow.create([{
            book: bookId,
            student: studentId,
            borrowDate,
            dueDate,
            status: 'BORROWED'
        }], { session });
        
        const createdBorrow = borrow[0];
        
        await session.commitTransaction();
        session.endSession();
        
        // 7. Dispatch user notification (Asynchronous trigger)
        const dateStr = dueDate.toLocaleDateString();
        await createNotification({
            userId: student.user._id,
            title: 'Book Borrowed Successfully',
            message: `You have successfully borrowed "${book.title}". Please return it on or before ${dateStr} to avoid late fines.`,
            type: 'SYSTEM'
        });
        
        return sendSuccess(res, 'Book borrowed successfully', createdBorrow, 201);
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// @desc    Return a borrowed book
// @route   POST /api/borrow/return/:id
// @access  Private (Admin/Librarian)
export const returnBook = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const borrowId = req.params.id;
        
        // 1. Fetch Borrow record
        const borrow = await Borrow.findById(borrowId).populate('book').populate({
            path: 'student',
            populate: { path: 'user' }
        }).session(session);
        
        if (!borrow) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Borrow transaction record not found', 404);
        }
        
        if (borrow.status === 'RETURNED') {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Book associated with this transaction has already been returned', 400);
        }
        
        const returnDate = new Date();
        const originalStatus = borrow.status;
        
        // 2. Increment book availability
        const book = borrow.book;
        book.availableCopies += 1;
        await book.save({ session });
        
        // 3. Mark returned
        borrow.returnDate = returnDate;
        borrow.status = 'RETURNED';
        await borrow.save({ session });
        
        let fineDetails = null;
        let isLate = originalStatus === 'OVERDUE' || isPastDue(borrow.dueDate);
        
        if (isLate) {
            // Calculate overdue days
            const daysOverdue = getDifferenceInDays(borrow.dueDate, returnDate);
            const calculatedFine = daysOverdue * parseInt(FINE_RATE_PER_DAY, 10);
            
            if (calculatedFine > 0) {
                // Save Fine record in DB
                const fine = await Fine.create([{
                    borrow: borrow._id,
                    student: borrow.student._id,
                    amount: calculatedFine,
                    status: 'UNPAID'
                }], { session });
                
                fineDetails = fine[0];
                
                // Update student aggregates
                const student = borrow.student;
                student.fineAmount += calculatedFine;
                await student.save({ session });
            }
        }
        
        await session.commitTransaction();
        session.endSession();
        
        // 4. Send appropriate alert notification
        if (fineDetails) {
            await createNotification({
                userId: borrow.student.user._id,
                title: 'Book Returned (Late Fee Assessed)',
                message: `You returned "${book.title}" ${getDifferenceInDays(borrow.dueDate, returnDate)} days late. A fine of ${fineDetails.amount} has been charged to your library card.`,
                type: 'FINE_ADDED'
            });
        } else {
            await createNotification({
                userId: borrow.student.user._id,
                title: 'Book Returned On-Time',
                message: `Thank you for returning "${book.title}" on-time!`,
                type: 'SYSTEM'
            });
        }
        
        return sendSuccess(res, 'Book returned successfully', {
            borrow,
            fineCharged: fineDetails ? fineDetails.amount : 0
        });
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// @desc    Get current student borrows history
// @route   GET /api/borrow/my-history
// @access  Private (Student)
export const getMyBorrows = async (req, res, next) => {
    try {
        if (req.user.role !== 'STUDENT') {
            return sendError(res, 'Access restricted to student accounts', 403);
        }
        
        const student = await Student.findOne({ user: req.user._id });
        if (!student) {
            return sendError(res, 'Student profile not found', 404);
        }
        
        const borrows = await Borrow.find({ student: student._id })
            .populate('book')
            .sort({ createdAt: -1 });
            
        return sendSuccess(res, 'Borrow history retrieved', borrows);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all borrow transaction history
// @route   GET /api/borrow/history
// @access  Private (Admin/Librarian)
export const getBorrowHistory = async (req, res, next) => {
    try {
        const { status, studentId } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (studentId) {
            query.student = studentId;
        }
        
        const history = await Borrow.find(query)
            .populate('book')
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ createdAt: -1 });
            
        return sendSuccess(res, 'System borrow records retrieved successfully', history);
    } catch (error) {
        next(error);
    }
};

// @desc    Process paying outstanding student fine
// @route   POST /api/borrow/pay-fine/:id
// @access  Private (Admin/Librarian)
export const payFine = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const fineId = req.params.id;
        
        // 1. Fetch Fine record
        const fine = await Fine.findById(fineId).populate({
            path: 'student',
            populate: { path: 'user' }
        }).session(session);
        
        if (!fine) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Fine record not found', 404);
        }
        
        if (fine.status === 'PAID') {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'Fine has already been settled and paid', 400);
        }
        
        const paidAmount = fine.amount;
        
        // 2. Settle fine
        fine.status = 'PAID';
        fine.paymentDate = new Date();
        await fine.save({ session });
        
        // 3. Deduct from student's aggregate fine balances
        const student = fine.student;
        student.fineAmount = Math.max(0, student.fineAmount - paidAmount);
        await student.save({ session });
        
        await session.commitTransaction();
        session.endSession();
        
        // 4. Send confirmation notification
        await createNotification({
            userId: student.user._id,
            title: 'Fine Payment Settled',
            message: `A fine payment of amount ${paidAmount} was successfully processed. Outstanding balances have been cleared.`,
            type: 'FINE_PAID'
        });
        
        return sendSuccess(res, 'Fine paid and cleared successfully', fine);
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
