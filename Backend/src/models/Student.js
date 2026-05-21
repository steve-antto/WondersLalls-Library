import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true,
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        trim: true,
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    borrowLimit: {
        type: Number,
        default: 5, // max 5 books borrowed at a time
    },
    fineAmount: {
        type: Number,
        default: 0, // aggregate unpaid fine
    },
    libraryCardNumber: {
        type: String,
        required: [true, 'Library Card Number is required'],
        unique: true,
        trim: true,
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
