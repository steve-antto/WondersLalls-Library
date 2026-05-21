import Borrow from '../models/Borrow.js';
import { createNotification } from '../services/notification.service.js';
import logger from '../config/logger.js';

export const runDueReminderJob = async () => {
    try {
        logger.info('Executing background DueReminderJob...');
        
        const now = new Date();
        const fortyEightHoursLater = new Date();
        fortyEightHoursLater.setHours(fortyEightHoursLater.getHours() + 48);
        
        // Find borrowed books whose dueDate falls within the next 48 hours
        const borrowings = await Borrow.find({
            status: 'BORROWED',
            dueDate: { $gte: now, $lte: fortyEightHoursLater }
        }).populate({
            path: 'student',
            populate: { path: 'user' }
        }).populate('book');
        
        logger.info(`DueReminderJob: Found ${borrowings.length} borrowings due in the next 48 hours.`);
        
        for (const borrow of borrowings) {
            const diffTime = Math.max(0, new Date(borrow.dueDate) - new Date());
            const hoursLeft = Math.ceil(diffTime / (1000 * 60 * 60));
            const dateStr = new Date(borrow.dueDate).toLocaleDateString();
            
            await createNotification({
                userId: borrow.student.user._id,
                title: 'Book Due Reminder',
                message: `Reminder: The book "${borrow.book.title}" you borrowed is due on ${dateStr} (approx. ${hoursLeft} hours remaining). Please return it to avoid late fees.`,
                type: 'DUE_REMINDER'
            });
        }
        
        logger.info('DueReminderJob execution completed.');
    } catch (error) {
        logger.error(`DueReminderJob failed: ${error.message}`);
    }
};
