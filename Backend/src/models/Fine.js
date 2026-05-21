import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
    borrow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrow',
        required: [true, 'Borrow reference is required'],
        unique: true, // One fine per borrow record
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student reference is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Fine amount is required'],
        min: [0, 'Fine amount cannot be negative'],
    },
    status: {
        type: String,
        enum: ['UNPAID', 'PAID'],
        default: 'UNPAID',
        required: true,
    },
    paymentDate: {
        type: Date,
    }
}, {
    timestamps: true
});

const Fine = mongoose.model('Fine', fineSchema);
export default Fine;
