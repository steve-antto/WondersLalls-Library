import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    qualifications: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 500 },
    availableDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);