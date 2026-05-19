import express from 'express';
import { sendWhatsAppContact } from '../services/whatsapp.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !message) {
            return res.status(400).json({ message: "Name and message are required." });
        }

        const result = await sendWhatsAppContact(name, email || 'Not provided', message);

        if (result) {
            res.status(200).json({ message: "Message sent successfully!" });
        } else {
            res.status(500).json({ message: "Failed to send message via WhatsApp." });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
