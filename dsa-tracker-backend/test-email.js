require('dotenv').config();
const nodemailer = require('nodemailer');

const sendTestEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_EMAIL);

    // Check if password is present (don't log it)
    if (!process.env.SMTP_PASSWORD) {
        console.error('ERROR: SMTP_PASSWORD is missing in .env');
        return;
    } else {
        console.log('SMTP_PASSWORD: [PRESENT] Length:', process.env.SMTP_PASSWORD.length);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.SMTP_EMAIL, // Send to self
            subject: 'DSA Tracker Test Email',
            text: 'If you see this, your email configuration is working correctly!',
        });
        console.log('SUCCESS: Email sent!', info.messageId);
    } catch (error) {
        console.error('FAILED: Could not send email.');
        console.error(error);
    }
};

sendTestEmail();
