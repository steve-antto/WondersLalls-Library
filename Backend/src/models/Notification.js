import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['DUE_REMINDER', 'OVERDUE', 'FINE_ADDED', 'FINE_PAID', 'SYSTEM'],
        default: 'SYSTEM',
        required: true,
    },
    readStatus: {
        type: Boolean,
        default: false,
        required: true,
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
