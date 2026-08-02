const { google } = require('googleapis');
const User = require('../models/User');

const getOAuth2Client = (redirectUriOverride) => {
    const redirectUri = redirectUriOverride || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
    );
};

const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Generates Google OAuth 2.0 authorization URL
 * 
 * @param {string} userId - User ID passed as state for context validation
 * @param {string} [redirectUri] - Optional custom redirect URI
 * @returns {string} Google Auth URL
 */
exports.generateAuthUrl = (userId, redirectUri) => {
    const oauth2Client = getOAuth2Client(redirectUri);
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: GMAIL_SCOPES,
        state: userId
    });
};

/**
 * Exchanges authorization code for Google tokens & retrieves user's Gmail address
 * 
 * @param {string} code - OAuth authorization code
 * @param {string} [redirectUri] - Optional custom redirect URI
 * @returns {Promise<{ tokens: Object, email: string }>} Tokens and Gmail email address
 */
exports.exchangeCodeForTokens = async (code, redirectUri) => {
    const oauth2Client = getOAuth2Client(redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user profile to get connected Gmail email address
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userinfo = await oauth2.userinfo.get();
    const gmailEmail = userinfo.data.email;

    return { tokens, email: gmailEmail };
};

/**
 * Returns an authenticated OAuth2 client configured for a given user,
 * automatically refreshing tokens using the stored refresh token.
 * 
 * @param {Object} user - Mongoose User document
 * @returns {Promise<google.auth.OAuth2>} Configured OAuth2 client
 */
exports.getAuthenticatedClient = async (user) => {
    if (!user.gmailAccount || !user.gmailAccount.connected || !user.gmailAccount.refreshToken) {
        throw new Error('Gmail account is not connected. Please connect your Gmail account.');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
        refresh_token: user.gmailAccount.refreshToken
    });

    // Handle token refresh event if refreshed
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token) {
            user.gmailAccount.refreshToken = tokens.refresh_token;
            await user.save();
        }
    });

    return oauth2Client;
};

/**
 * Revokes Google OAuth token for a user
 * 
 * @param {Object} user - Mongoose User document
 */
exports.revokeAccess = async (user) => {
    if (user.gmailAccount && user.gmailAccount.refreshToken) {
        try {
            const oauth2Client = getOAuth2Client();
            await oauth2Client.revokeToken(user.gmailAccount.refreshToken);
        } catch (err) {
            console.warn('Warning revoking Google token:', err.message);
        }
    }
};
