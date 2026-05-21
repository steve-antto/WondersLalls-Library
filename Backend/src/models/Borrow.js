import mongoose from 'mongoose';

const borrowSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book reference is required'],
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student reference is required'],
    },
    borrowDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
        default: 'BORROWED',
        required: true,
    }
}, {
    timestamps: true
});

const Borrow = mongoose.model('Borrow', borrowSchema);
export default Borrow;
