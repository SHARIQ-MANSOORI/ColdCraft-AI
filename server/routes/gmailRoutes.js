const express = require('express');
const router = express.Router();
const gmailController = require('../controller/gmailController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// OAuth & Connection Routes
router.get('/connect', authMiddleware, gmailController.connectGmail);
router.get('/callback', gmailController.handleOAuthCallback);
router.get('/status', authMiddleware, gmailController.getGmailStatus);
router.post('/disconnect', authMiddleware, gmailController.disconnectGmail);

// Send Email via Gmail API (Supports up to 5 outbound attachments under field name 'attachments')
router.post('/send', authMiddleware, (req, res, next) => {
    uploadMiddleware.array('attachments', 5)(req, res, (err) => {
        if (err) {
            console.error('Attachment upload error:', err.message);
            return res.status(400).json({ message: err.message || 'Error processing attachments.' });
        }
        next();
    });
}, gmailController.sendGmailEmail);

module.exports = router;
