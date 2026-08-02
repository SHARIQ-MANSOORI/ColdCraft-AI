const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Sends an email using Nodemailer & Gmail SMTP credentials
 * 
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[DEV MODE] Email credentials not configured. OTP for ${options.to}:\nSubject: ${options.subject}\nBody: ${options.text}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Default clean HTML template if custom html is not provided
        const defaultHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 24px;">ColdCraft<span style="color: #10b981;">.ai</span></h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Email Verification Code</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #334155; margin-bottom: 12px;">Your verification OTP is:</p>
                <h1 style="font-size: 32px; letter-spacing: 6px; color: #2563eb; margin: 0; font-weight: 800;">${options.text.match(/\d{6}/)?.[0] || options.text}</h1>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 12px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this code, please ignore this email.</p>
        </div>
        `;

        const mailOptions = {
            from: `"ColdCraft AI" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html || defaultHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SUCCESS] OTP email sent to ${options.to} (MessageId: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send email via SMTP:', error.message);
        // Log dev fallback in console so registration can still be tested locally if SMTP fails
        console.log(`[DEV FALLBACK] Notification for ${options.to}: ${options.text}`);
        throw error;
    }
};

module.exports = sendEmail;