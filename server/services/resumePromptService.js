/**
 * Builds an enriched prompt for the Groq AI model based on the 3 input scenarios:
 * 1. Document Only (extracted document text, empty prompt)
 * 2. Prompt Only (user description, no document)
 * 3. Prompt + Document (user description combined with extracted document details)
 * 
 * @param {string} userPrompt - Optional text prompt provided by user
 * @param {string} documentText - Extracted text from uploaded resume/document
 * @returns {string} Enriched prompt string to pass to LLM completion
 */
exports.buildEnrichedPrompt = (userPrompt = '', documentText = '') => {
    const hasPrompt = Boolean(userPrompt && userPrompt.trim().length > 0);
    const hasDoc = Boolean(documentText && documentText.trim().length > 0);

    // Limit document text to ~4000 characters to ensure safe token usage
    const safeDocText = hasDoc ? documentText.slice(0, 4000) : '';

    if (hasDoc && !hasPrompt) {
        // Scenario 1: Document ONLY
        return `
[DOCUMENT-ONLY GENERATION REQUEST]
I have uploaded my resume/document text below. Please extract my key background information (skills, work experience, key projects, education, certifications, and achievements) and generate a highly tailored, compelling B2B cold email sequence highlighting my strengths and fit for potential opportunities.

--- BEGIN EXTRACTED DOCUMENT CONTENT ---
${safeDocText}
--- END EXTRACTED DOCUMENT CONTENT ---
`.trim();
    }

    if (hasDoc && hasPrompt) {
        // Scenario 3: Prompt + Document (Combined)
        return `
[COMBINED PROMPT & DOCUMENT GENERATION REQUEST]
User Instructions / Target Context:
${userPrompt.trim()}

--- EXTRACTED RESUME / DOCUMENT CONTENT ---
${safeDocText}
--- END EXTRACTED DOCUMENT CONTENT ---

Please synthesize the user's instructions with the candidate's extracted skills, experience, and achievements from the document to generate a highly personalized, context-aware email sequence.
`.trim();
    }

    // Scenario 2: Prompt ONLY
    return userPrompt.trim();
};
