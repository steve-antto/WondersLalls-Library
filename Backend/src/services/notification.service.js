import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { sendEmail } from './email.service.js';
import { sendSMS } from './sms.service.js';
import logger from '../config/logger.js';

export const createNotification = async ({ userId, title, message, type }) => {
    try {
        // 1. Save notification record in database
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
        });

        // 2. Fetch user to send communications
        const user = await User.findById(userId);
        if (user) {
            // Send email notification
            await sendEmail({
                to: user.email,
                subject: `Library System: ${title}`,
                text: message,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #4CAF50;">${title}</h2>
                        <p>${message}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <small style="color: #777;">This is an automated message from the Library Management System. Please do not reply.</small>
                       </div>`
            });

            // Send SMS if student details are available
            const student = await Student.findOne({ user: userId });
            if (student && student.phoneNumber) {
                await sendSMS({
                    to: student.phoneNumber,
                    message: `Library Alert - ${title}: ${message}`,
                });
            }
        }

        return notification;
    } catch (error) {
        logger.error(`Failed to execute notification creation service: ${error.message}`);
    }
};
