const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    console.log('sendEmail: Starting...');
    console.log('sendEmail: Env Check -> Host:', process.env.SMTP_HOST, 'User:', process.env.SMTP_EMAIL);

    // Debug logging removed for production safety (Render/Vercel read-only FS)
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);


    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // 2) Define the email options
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Actually send the email
    try {
        const info = await transporter.sendMail(message);
        console.log('sendEmail: SUCCESS. Message ID:', info.messageId);
    } catch (err) {
        console.error('sendEmail: FAILED.', err);
        throw err;
    }
};

module.exports = sendEmail;
