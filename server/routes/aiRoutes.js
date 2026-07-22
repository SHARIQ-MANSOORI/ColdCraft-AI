const express  = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate-email',authMiddleware,aiController.generateEmail); // this route is protected by authMiddleware, only logged in users can access it

module.exports = router;