import Doctor from '../models/doctor.model.js';

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate('userId', 'name email phone isActive')
            .select('-__v');
        return res.json({ doctors });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
};

export const updateDoctorProfile = async (req, res) => {
    const { id } = req.params; // Doctor collection ID
    const { consultationFee, availableDays } = req.body;

    try {
        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { consultationFee, availableDays },
            { new: true }
        ).populate('userId', 'name');

        if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

        return res.json({ doctor });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
    }
};