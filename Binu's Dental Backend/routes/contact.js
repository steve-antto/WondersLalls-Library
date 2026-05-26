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
            console.log(`✅ Contact message from ${name} forwarded via WhatsApp.`);
        } else {
            console.warn(`⚠️ WhatsApp forwarding failed for contact message from ${name}. Msg: "${message}"`);
        }

        return res.status(200).json({ message: "Message received successfully!" });
    } catch (error) {
        next(error);
    }
});

export default router;
