const axios = require('axios');
const EmailHistory = require('../models/emailHistory');
const getSystemPrompt = require('../prompts/systemPrompt');
const documentParserService = require('../services/documentParserService');
const resumePromptService = require('../services/resumePromptService');

exports.generateEmail = async (req, res) => {
    const { prompt = '', tone = 'Professional', length = 'Medium' } = req.body;
    const uploadedFile = req.file;

    // Validate that at least a prompt OR a document file is provided
    if ((!prompt || prompt.trim().length === 0) && !uploadedFile) {
        return res.status(400).json({ message: 'Please provide a prompt or upload a resume/document.' });
    }

    if (prompt && prompt.length > 3000) {
        return res.status(400).json({ message: 'Prompt should not exceed 3000 characters.' });
    }

    try {
        let extractedDocumentText = '';

        // Extract text if a document file was uploaded
        if (uploadedFile) {
            extractedDocumentText = await documentParserService.parseDocument(uploadedFile);
        }

        // Build enriched AI prompt combining user prompt & document text
        const finalPrompt = resumePromptService.buildEnrichedPrompt(prompt, extractedDocumentText);

        const activeSystemPrompt = getSystemPrompt(tone, length);

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: activeSystemPrompt },
                { role: 'user', content: finalPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 45000
        });

        const rawAiResponse = response.data.choices[0].message.content;

        // Clean potential markdown wrappers (```json ... ```) from LLM output
        const cleanJsonResponse = (text) => {
            if (!text) return '';
            let cleaned = text.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }
            return cleaned;
        };

        const cleanedJson = cleanJsonResponse(rawAiResponse);

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedJson);
        } catch (err) {
            console.error('Failed to parse AI response JSON:', rawAiResponse);
            return res.status(500).json({
                message: 'Invalid JSON format received from AI.',
                rawResponse: rawAiResponse
            });
        }

        const { subject, emailBody, linkedInDM, followUpEmail } = parsedResponse;

        // Display summary prompt in history
        const savedPrompt = prompt.trim() || (uploadedFile ? `[Resume Upload: ${uploadedFile.originalname}]` : 'AI Email Generation');

        const emailHistory = await EmailHistory.create({
            user: req.user._id,
            prompt: savedPrompt,
            tone,
            length,
            subject,
            emailBody,
            linkedInDM,
            followUpEmail
        });

        return res.status(200).json({
            success: true,
            message: 'Email generated successfully.',
            data: emailHistory
        });

    } catch (error) {
        const detailMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
        console.error('Error generating email:', detailMsg);
        return res.status(500).json({
            message: detailMsg || 'Error generating email',
            error: detailMsg
        });
    }
};


exports.getHistory = async (req,res)=>{
    try {
        const emailHistories = await EmailHistory.find({user:req.user._id}).sort({createdAt:-1});  
        return res.status(200).json(emailHistories);
    } catch (error) {
        console.log('Error retrieving email history:', error.message);
        return res.status(500).json({
            message: 'Error retrieving email history',
            error: error.message
        });
    }
};