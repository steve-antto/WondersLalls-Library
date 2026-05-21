import cron from 'node-cron';
import { runDueReminderJob } from '../jobs/dueReminder.job.js';
import { runOverdueReminderJob } from '../jobs/overdueReminder.job.js';
import logger from '../config/logger.js';

export const initCronJobs = () => {
    logger.info('Initializing background cron job scheduler...');
    
    // Schedule to run daily at 12:00 AM (Midnight)
    cron.schedule('0 0 * * *', async () => {
        logger.info('Executing scheduled daily cron jobs...');
        try {
            await runDueReminderJob();
            await runOverdueReminderJob();
            logger.info('Scheduled daily cron jobs completed successfully.');
        } catch (error) {
            logger.error(`Scheduled cron jobs failed: ${error.message}`);
        }
    });
    
    // Execute immediately on system boot if in development for easy verification
    if (process.env.NODE_ENV === 'development') {
        logger.info('Development Environment: Triggering immediate startup run for background jobs...');
        // Run asynchronously to not block server bootstrap
        Promise.all([runDueReminderJob(), runOverdueReminderJob()])
            .then(() => logger.info('Immediate startup cron jobs finished.'))
            .catch((err) => logger.error(`Immediate startup cron jobs failed: ${err.message}`));
    }
};
