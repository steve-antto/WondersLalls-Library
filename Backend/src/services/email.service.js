import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } from '../config/env.js';
import logger from '../config/logger.js';

let transporter;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
    logger.info('Nodemailer SMTP Transporter configured.');
} else {
    logger.info('Nodemailer running in Mock Mode (emails will be logged to console).');
}

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (transporter) {
            const info = await transporter.sendMail({
                from: SMTP_FROM_EMAIL,
                to,
                subject,
                text,
                html,
            });
            logger.info(`Email successfully sent to ${to}: ${info.messageId}`);
            return true;
        } else {
            logger.info(`\n========== [MOCK EMAIL DISPATCH] ==========\nTo: ${to}\nSubject: ${subject}\nBody: ${text || html}\n===========================================\n`);
            return true;
        }
    } catch (error) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
        return false;
    }
};
