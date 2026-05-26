// Meta WhatsApp Business Cloud API
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_URL = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;

if (WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
    console.log('✅ Meta WhatsApp Cloud API initialized.');
} else {
    console.log('⚠️  WhatsApp credentials not set. Auto-reminders disabled.');
}

/**
 * Send WhatsApp appointment reminder via Meta Cloud API
 */
export const sendWhatsAppReminder = async (phone, patientName, date, time, service) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('WhatsApp not configured — skipping.');
        return null;
    }

    // Format phone: ensure country code, remove spaces/symbols
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;

    const body = `🦷 *Appointment Confirmed!*

Hi ${patientName},
Your appointment at *Dr. Binu's Dental Clinic* is confirmed.

📅 Date: ${date}
⏰ Time: ${time}
🏥 Service: ${service}
📍 Sivananda Colony, Coimbatore - 641012

Please arrive 10 mins early.
📞 Call +91 77080 56650 to reschedule.

Thank you for choosing us! 😊`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: formattedPhone,
                type: 'text',
                text: { body }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText);
        }

        console.log(`✅ WhatsApp sent to +${formattedPhone} | ID: ${data.messages?.[0]?.id}`);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.message);
        return null;
    }
};

export const sendWhatsAppContact = async (name, email, message) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('WhatsApp not configured — skipping.');
        return null;
    }

    const doctorPhone = '917708056650'; // Target phone number (Dr. Binu)

    const body = `📬 *New Contact Us Message!*

*Name:* ${name}
*Email:* ${email}

*Message:*
${message}

Please reply to the patient promptly. 😊`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: doctorPhone,
                type: 'text',
                text: { body }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText);
        }

        console.log(`✅ Contact WhatsApp sent to Dr. Binu`);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.message);
        return null;
    }
};

export default { sendWhatsAppReminder, sendWhatsAppContact };
