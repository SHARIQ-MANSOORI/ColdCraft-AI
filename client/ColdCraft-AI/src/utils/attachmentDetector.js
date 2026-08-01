/**
 * Detects whether a text prompt contains phrases indicating the user intended to attach a resume or document.
 * 
 * @param {string} promptText - The user's input text prompt
 * @returns {boolean} True if attachment phrases are detected
 */
export const detectMissingAttachment = (promptText = '') => {
    if (!promptText || typeof promptText !== 'string') return false;

    const lower = promptText.toLowerCase();

    const attachmentPatterns = [
        /attach(ed|ment)?\s+(my\s+)?(resume|cv|file|document|pdf|docx|bio)/i,
        /find\s+(my\s+)?(attached|the\s+attached)\s+(resume|cv|file|document|pdf)/i,
        /please\s+see\s+(my\s+)?(attached|the\s+attached)/i,
        /see\s+(my\s+)?(attached|the\s+attached)\s+(resume|cv|file|document)/i,
        /resume\s+is\s+attached/i,
        /cv\s+is\s+attached/i,
        /document\s+is\s+attached/i,
        /as\s+attached/i,
        /with\s+the\s+attached\s+(resume|cv|file|document)/i,
        /uploaded\s+(my\s+)?(resume|cv|document)/i
    ];

    return attachmentPatterns.some(pattern => pattern.test(lower));
};
