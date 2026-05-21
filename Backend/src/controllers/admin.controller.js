import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Borrow from '../models/Borrow.js';
import Fine from '../models/Fine.js';
import { sendSuccess } from '../utils/responseHandler.js';

// @desc    Get dashboard statistics for Admin/Librarian overview
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin/Librarian)
export const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Catalog aggregates
        const totalBooksCount = await Book.countDocuments();
        
        const copiesAggregation = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    totalCopies: { $sum: '$totalCopies' },
                    availableCopies: { $sum: '$availableCopies' }
                }
            }
        ]);
        
        const totalCopies = copiesAggregation[0] ? copiesAggregation[0].totalCopies : 0;
        const availableCopies = copiesAggregation[0] ? copiesAggregation[0].availableCopies : 0;
        
        // 2. Student aggregates
        const totalStudentsCount = await Student.countDocuments();
        
        const fineAggregation = await Student.aggregate([
            {
                $group: {
                    _id: null,
                    totalOutstandingFines: { $sum: '$fineAmount' }
                }
            }
        ]);
        
        const totalOutstandingFines = fineAggregation[0] ? fineAggregation[0].totalOutstandingFines : 0;
        
        // 3. Settled fines aggregate
        const settledFinesAggregation = await Fine.aggregate([
            { $match: { status: 'PAID' } },
            {
                $group: {
                    _id: null,
                    totalSettledFines: { $sum: '$amount' }
                }
            }
        ]);
        
        const totalSettledFines = settledFinesAggregation[0] ? settledFinesAggregation[0].totalSettledFines : 0;
        
        // 4. Borrowing status stats
        const activeBorrows = await Borrow.countDocuments({ status: 'BORROWED' });
        const overdueBorrows = await Borrow.countDocuments({ status: 'OVERDUE' });
        const totalActiveBorrows = activeBorrows + overdueBorrows;
        
        const overdueRate = totalActiveBorrows > 0 ? ((overdueBorrows / totalActiveBorrows) * 100).toFixed(1) : 0;
        
        // 5. Recent borrowings (Top 5)
        const recentBorrows = await Borrow.find()
            .populate('book', 'title author')
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .limit(5);
            
        return sendSuccess(res, 'Dashboard statistics compiled successfully', {
            catalog: {
                totalTitles: totalBooksCount,
                totalCopies,
                availableCopies,
                borrowedCopies: totalCopies - availableCopies
            },
            students: {
                totalRegistered: totalStudentsCount
            },
            borrows: {
                active: activeBorrows,
                overdue: overdueBorrows,
                totalActive: totalActiveBorrows,
                overdueRate: `${overdueRate}%`
            },
            fines: {
                totalOutstanding: totalOutstandingFines,
                totalCollected: totalSettledFines
            },
            recentActivity: recentBorrows
        });
    } catch (error) {
        next(error);
    }
};
