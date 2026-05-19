const fs = require('fs');
const p = "/home/castlo/Documents/Binu's Dental/Binu's Dental Backend/services/whatsapp.js";
let code = fs.readFileSync(p, 'utf8');

const newFunc = `
export const sendWhatsAppContact = async (name, email, message) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('WhatsApp not configured — skipping.');
        return null;
    }

    const doctorPhone = '917708056650'; // Target phone number (Dr. Binu)

    const body = \`📬 *New Contact Us Message!*

*Name:* \${name}
*Email:* \${email}

*Message:*
\${message}

Please reply to the patient promptly. 😊\`;

    try {
        const response = await axios.post(API_URL, {
            messaging_product: 'whatsapp',
            to: doctorPhone,
            type: 'text',
            text: { body }
        }, {
            headers: {
                'Authorization': \`Bearer \${WHATSAPP_TOKEN}\`,
                'Content-Type': 'application/json'
            }
        });
        console.log(\`✅ Contact WhatsApp sent to Dr. Binu |\`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.response?.data || error.message);
        return null;
    }
};
`;

code = code.replace("export default { sendWhatsAppReminder };", newFunc + "\nexport default { sendWhatsAppReminder, sendWhatsAppContact };");

fs.writeFileSync(p, code);
