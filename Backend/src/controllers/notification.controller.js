import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 });
            
        return sendSuccess(res, 'Notifications fetched successfully', notifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return sendError(res, 'Notification not found', 404);
        }
        
        // Assert ownership
        if (notification.user.toString() !== req.user._id.toString()) {
            return sendError(res, 'Access denied, this notification belongs to another account', 403);
        }
        
        notification.readStatus = true;
        await notification.save();
        
        return sendSuccess(res, 'Notification marked as read', notification);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, readStatus: false },
            { readStatus: true }
        );
        
        return sendSuccess(res, 'All notifications marked as read');
    } catch (error) {
        next(error);
    }
};
