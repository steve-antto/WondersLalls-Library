import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminauth.js';
import Appointment from '../models/appointments.model.js';
import User from '../models/user.js';
import { sendWhatsAppReminder } from '../services/whatsapp.js';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointment.controller.js';

const appointmentsRouter = new Router();

// ─── PUBLIC: Get booked slots for a date ───
appointmentsRouter.get('/booked-slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.json({ bookedSlots: [] });
    try {
        const appointments = await Appointment.find({ date, status: { $ne: 'cancelled' } }).select('time');
        const bookedSlots = appointments.map(a => a.time);
        return res.json({ bookedSlots });
    } catch (err) {
        return res.json({ bookedSlots: [] });
    }
});

// ─── PUBLIC BOOKING ───
appointmentsRouter.post('/public-book', async (req, res) => {
    const { patientName, phone, email, service, date, time, notes } = req.body;
    if (!patientName || !phone || !date || !time) return res.status(400).json({ message: 'Name, phone, date, and time are required.' });

    // Block Sundays
    if (new Date(date).getDay() === 0) return res.status(400).json({ message: 'Sundays are holidays. Please choose another day.' });

    // Check if slot is already booked
    const existing = await Appointment.findOne({ date, time, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'This time slot is already booked. Please choose another.' });

    try {
        let patient = null;
        if (email) patient = await User.findOne({ email });
        if (!patient) patient = await User.findOne({ phone });
        if (!patient) {
            patient = await User.create({ name: patientName, phone, email: email || `guest_${Date.now()}@guest.local`, firebaseUid: `guest_${Date.now()}`, role: 'patient' });
        }

        const newAppointment = await Appointment.create({
            patientId: patient._id, patientName, patientPhone: phone, patientEmail: email || '',
            date, time, service: service || 'Consultation', status: 'scheduled', notes: notes || '', source: 'website'
        });

        sendWhatsAppReminder(phone, patientName, date, time, service || 'Consultation').catch(err => console.error('WhatsApp error:', err));

        return res.status(201).json({ success: true, message: 'Appointment booked successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({ message: 'Failed to book appointment.' });
    }
});

// ─── AUTHENTICATED ROUTES ───
appointmentsRouter.use(authenticate);
appointmentsRouter.get('/', getAppointments);
appointmentsRouter.post('/', createAppointment);
appointmentsRouter.patch('/:id/status', requireAdmin, updateAppointmentStatus);

// ─── ADMIN: Update payment status ───
appointmentsRouter.patch('/:id/payment', requireAdmin, async (req, res) => {
    const { paymentStatus, paymentAmount } = req.body;
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { paymentStatus, paymentAmount }, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ message: 'Appointment not found' });
    return res.json({ success: true, appointment: updated });
});

export default appointmentsRouter;