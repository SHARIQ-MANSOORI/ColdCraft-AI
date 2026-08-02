const User = require('../models/User');
const gmailAuthService = require('../services/gmailAuthService');
const gmailSendService = require('../services/gmailSendService');

/**
 * Generates Google OAuth consent URL and returns or redirects
 */
exports.connectGmail = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const authUrl = gmailAuthService.generateAuthUrl(userId);
        
        // Return URL for SPA client navigation
        return res.status(200).json({ success: true, authUrl });
    } catch (error) {
        console.error('Error generating Google auth URL:', error.message);
        return res.status(500).json({ message: 'Failed to initiate Google OAuth consent.' });
    }
};

/**
 * Handles Google OAuth Callback, exchanges code for tokens, and saves Gmail connection
 */
exports.handleOAuthCallback = async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        console.warn('Google OAuth denied by user:', error);
        return res.redirect('http://localhost:5173/dashboard?gmail=denied');
    }

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing.' });
    }

    try {
        const { tokens, email } = await gmailAuthService.exchangeCodeForTokens(code);

        // Find user by state (userId passed during auth request) or fallback to req.user if present
        let user;
        if (state) {
            user = await User.findById(state);
        } else if (req.user) {
            user = req.user;
        }

        if (!user) {
            return res.status(404).json({ message: 'Associated user account not found.' });
        }

        // Save connection details in User model
        user.gmailAccount = {
            connected: true,
            email: email,
            refreshToken: tokens.refresh_token || (user.gmailAccount ? user.gmailAccount.refreshToken : ''),
            connectedAt: new Date()
        };

        await user.save();

        // Redirect back to frontend dashboard with success query parameter
        return res.redirect('http://localhost:5173/dashboard?gmail=connected');
    } catch (err) {
        console.error('Error during Google OAuth callback:', err.message);
        return res.redirect('http://localhost:5173/dashboard?gmail=error');
    }
};

/**
 * Returns current user's Gmail connection status
 */
exports.getGmailStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('gmailAccount');
        const status = user && user.gmailAccount ? user.gmailAccount : { connected: false, email: '' };
        
        return res.status(200).json({
            connected: Boolean(status.connected),
            email: status.email || '',
            connectedAt: status.connectedAt || null
        });
    } catch (error) {
        console.error('Error retrieving Gmail status:', error.message);
        return res.status(500).json({ message: 'Failed to fetch Gmail status.' });
    }
};

/**
 * Disconnects Gmail account & revokes Google OAuth tokens
 */
exports.disconnectGmail = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Revoke Google OAuth token
        await gmailAuthService.revokeAccess(user);

        // Reset Gmail connection fields
        user.gmailAccount = {
            connected: false,
            email: '',
            refreshToken: '',
            connectedAt: null
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Gmail account disconnected successfully.'
        });
    } catch (error) {
        console.error('Error disconnecting Gmail:', error.message);
        return res.status(500).json({ message: 'Failed to disconnect Gmail account.' });
    }
};

/**
 * Sends outbound email via connected Gmail API with optional attachments
 */
exports.sendGmailEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.gmailAccount || !user.gmailAccount.connected) {
            return res.status(400).json({
                message: 'Your Gmail account is not connected. Please connect Gmail first.'
            });
        }

        const { to, cc, bcc, replyTo, subject, emailBody } = req.body;
        const attachmentFiles = req.files || [];

        const result = await gmailSendService.sendEmailViaGmail(
            user,
            { to, cc, bcc, replyTo, subject, emailBody },
            attachmentFiles
        );

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully via Gmail API!',
            data: result
        });
    } catch (error) {
        console.error('Error sending email via Gmail API:', error.message);
        return res.status(500).json({
            message: error.message || 'Failed to send email via Gmail API.'
        });
    }
};
