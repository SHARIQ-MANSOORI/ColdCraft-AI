const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const gmailAuthService = require('./gmailAuthService');

/**
 * Builds an RFC 2822 MIME string using Nodemailer Stream Transport
 */
const buildRawMimeMessage = (mailOptions) => {
    return new Promise((resolve, reject) => {
        const transport = nodemailer.createTransport({
            streamTransport: true,
            newline: 'windows'
        });

        transport.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err);

            const chunks = [];
            info.message.on('data', (chunk) => chunks.push(chunk));
            info.message.on('end', () => {
                const mimeBuffer = Buffer.concat(chunks);
                resolve(mimeBuffer);
            });
            info.message.on('error', (streamErr) => reject(streamErr));
        });
    });
};

/**
 * Sends an email via Gmail API on behalf of the connected user
 * 
 * @param {Object} user - Mongoose User document
 * @param {Object} emailData - Email fields { to, cc, bcc, replyTo, subject, emailBody }
 * @param {Array<Object>} [attachmentFiles] - Express Multer file objects for outbound attachments
 * @returns {Promise<Object>} Gmail API response data
 */
exports.sendEmailViaGmail = async (user, emailData, attachmentFiles = []) => {
    const { to, cc, bcc, replyTo, subject, emailBody } = emailData;

    if (!to || !to.trim()) {
        throw new Error('Recipient email (To) is required.');
    }

    if (!subject || !subject.trim()) {
        throw new Error('Email subject is required.');
    }

    // Retrieve authenticated OAuth2 client with auto-refreshed access token
    const oauth2Client = await gmailAuthService.getAuthenticatedClient(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Format attachments for Nodemailer
    const formattedAttachments = [];
    if (attachmentFiles && attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
            formattedAttachments.push({
                filename: file.originalname,
                path: file.path,
                contentType: file.mimetype
            });
        }
    }

    const mailOptions = {
        from: user.gmailAccount.email,
        to: to.trim(),
        cc: cc && cc.trim() ? cc.trim() : undefined,
        bcc: bcc && bcc.trim() ? bcc.trim() : undefined,
        replyTo: replyTo && replyTo.trim() ? replyTo.trim() : undefined,
        subject: subject.trim(),
        text: emailBody,
        html: emailBody ? emailBody.replace(/\n/g, '<br>') : '',
        attachments: formattedAttachments
    };

    try {
        // Compile raw RFC 2822 MIME message
        const rawMimeBuffer = await buildRawMimeMessage(mailOptions);

        // Convert MIME buffer to URL-safe base64 string
        const rawBase64 = rawMimeBuffer.toString('base64url');

        // Send via Gmail API
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawBase64
            }
        });

        return response.data;
    } finally {
        // Clean up outbound temporary attachment files from disk
        if (attachmentFiles && attachmentFiles.length > 0) {
            for (const file of attachmentFiles) {
                try {
                    if (fs.existsSync(file.path)) {
                        await fs.promises.unlink(file.path);
                    }
                } catch (cleanupErr) {
                    console.warn(`Failed to cleanup temp attachment ${file.path}:`, cleanupErr.message);
                }
            }
        }
    }
};
