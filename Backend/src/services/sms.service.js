import logger from '../config/logger.js';

export const sendSMS = async ({ to, message }) => {
    try {
        logger.info(`\n========== [MOCK SMS DISPATCH] ==========\nTo: ${to}\nMessage: ${message}\n==========================================\n`);
        return true;
    } catch (error) {
        logger.error(`Error sending SMS to ${to}: ${error.message}`);
        return false;
    }
};
