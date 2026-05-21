import mongoose from 'mongoose';
import Borrow from '../models/Borrow.js';
import Fine from '../models/Fine.js';
import Student from '../models/Student.js';
import { createNotification } from '../services/notification.service.js';
import { getDifferenceInDays } from '../utils/dateHelper.js';
import { FINE_RATE_PER_DAY } from '../config/env.js';
import logger from '../config/logger.js';

export const runOverdueReminderJob = async () => {
    try {
        logger.info('Executing background OverdueReminderJob...');
        const now = new Date();
        
        // Find borrowings that are past due date and not returned
        const overdueBorrowings = await Borrow.find({
            status: { $in: ['BORROWED', 'OVERDUE'] },
            dueDate: { $lt: now }
        }).populate({
            path: 'student',
            populate: { path: 'user' }
        }).populate('book');
        
        logger.info(`OverdueReminderJob: Found ${overdueBorrowings.length} borrowings past due.`);
        
        for (const borrow of overdueBorrowings) {
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                // Update status to OVERDUE if it was BORROWED
                if (borrow.status === 'BORROWED') {
                    borrow.status = 'OVERDUE';
                    await borrow.save({ session });
                }
                
                const daysOverdue = getDifferenceInDays(borrow.dueDate, now);
                const latestFineAmount = daysOverdue * parseInt(FINE_RATE_PER_DAY, 10);
                
                if (latestFineAmount > 0) {
                    let fine = await Fine.findOne({ borrow: borrow._id }).session(session);
                    let fineDifference = latestFineAmount;
                    
                    if (fine) {
                        if (fine.status === 'UNPAID') {
                            fineDifference = latestFineAmount - fine.amount;
                            fine.amount = latestFineAmount;
                            await fine.save({ session });
                        } else {
                            fineDifference = 0; // If already paid, do not recalculate additional fines on this borrow
                        }
                    } else {
                        await Fine.create([{
                            borrow: borrow._id,
                            student: borrow.student._id,
                            amount: latestFineAmount,
                            status: 'UNPAID'
                        }], { session });
                    }
                    
                    // Increment the student fine balances by the new difference
                    if (fineDifference > 0) {
                        const student = await Student.findById(borrow.student._id).session(session);
                        student.fineAmount += fineDifference;
                        await student.save({ session });
                    }
                }
                
                await session.commitTransaction();
                session.endSession();
                
                // Dispatch alert notification (Async)
                await createNotification({
                    userId: borrow.student.user._id,
                    title: 'CRITICAL: Book Overdue Alert',
                    message: `Your borrowed book "${borrow.book.title}" was due on ${new Date(borrow.dueDate).toLocaleDateString()}. It is now ${daysOverdue} days overdue. An accumulated late fine of ${latestFineAmount} has been applied. Please return the book immediately.`,
                    type: 'OVERDUE'
                });
            } catch (innerError) {
                await session.abortTransaction();
                session.endSession();
                logger.error(`Error processing overdue record ${borrow._id}: ${innerError.message}`);
            }
        }
        
        logger.info('OverdueReminderJob execution completed.');
    } catch (error) {
        logger.error(`OverdueReminderJob failed: ${error.message}`);
    }
};
