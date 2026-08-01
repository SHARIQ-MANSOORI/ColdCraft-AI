const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Accept optional single file upload under field name 'document'
router.post('/generate-email', authMiddleware, (req, res, next) => {
    uploadMiddleware.single('document')(req, res, (err) => {
        if (err) {
            console.error('File upload error:', err.message);
            return res.status(400).json({ message: err.message || 'Error processing uploaded file.' });
        }
        next();
    });
}, aiController.generateEmail);
router.get('/history', authMiddleware, aiController.getHistory);

module.exports = router;