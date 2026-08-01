const fs = require('fs');
const path = require('path');
const pdfModule = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Universal helper to extract text from a PDF buffer regardless of pdf-parse export type.
 */
const extractPdfText = async (dataBuffer) => {
    try {
        if (typeof pdfModule === 'function') {
            const res = await pdfModule(dataBuffer);
            return res.text || '';
        } else if (pdfModule.default && typeof pdfModule.default === 'function') {
            const res = await pdfModule.default(dataBuffer);
            return res.text || '';
        } else if (pdfModule.PDFParse) {
            const instance = new pdfModule.PDFParse({ data: dataBuffer });
            const res = await instance.getText();
            return typeof res === 'string' ? res : (res?.text || JSON.stringify(res || ''));
        } else {
            throw new Error('Unsupported pdf-parse module structure.');
        }
    } catch (err) {
        console.warn('Primary PDF parsing failed, trying raw text extraction fallback:', err.message);
        const rawStr = dataBuffer.toString('utf-8');
        // Extract basic ASCII printable text strings from buffer as fallback
        const matches = rawStr.match(/[\x20-\x7E]{4,}/g);
        return matches ? matches.join(' ') : '';
    }
};

/**
 * Parses text from an uploaded PDF, DOCX, or TXT file
 * and immediately deletes the temporary file from disk.
 * 
 * @param {Object} file - Express Multer file object
 * @returns {Promise<string>} Extracted text from document
 */
exports.parseDocument = async (file) => {
    if (!file || !file.path) {
        throw new Error('No document file provided for parsing.');
    }

    const filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    let extractedText = '';

    try {
        if (ext === '.pdf') {
            const dataBuffer = await fs.promises.readFile(filePath);
            extractedText = await extractPdfText(dataBuffer);
        } else if (ext === '.docx' || ext === '.doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value || '';
        } else if (ext === '.txt') {
            extractedText = await fs.promises.readFile(filePath, 'utf-8');
        } else {
            throw new Error(`Unsupported document extension: ${ext}`);
        }

        // Clean up extracted text (normalize whitespace)
        extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

        if (!extractedText) {
            extractedText = `[Uploaded document: ${file.originalname}]`;
        }

        return extractedText;
    } catch (error) {
        console.error(`Error parsing document (${file.originalname}):`, error.message);
        throw new Error(`Failed to extract text from document: ${error.message}`);
    } finally {
        // Ensure temporary file is ALWAYS unlinked / deleted from disk
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (cleanupErr) {
            console.warn(`Failed to delete temp file ${filePath}:`, cleanupErr.message);
        }
    }
};
