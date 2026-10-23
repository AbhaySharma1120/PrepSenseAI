import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

export const extractTextFromPDF = async (pdfBuffer) => {
    try {
        let extractedText = '';

        if (typeof pdfModule === 'function') {
            // pdf-parse v1
            const data = await pdfModule(pdfBuffer);
            extractedText = data.text || '';
        } else if (pdfModule && pdfModule.PDFParse) {
            // pdf-parse v2+
            const parser = new pdfModule.PDFParse({ data: pdfBuffer });
            const result = await parser.getText();
            extractedText = result.text || '';
            if (typeof parser.destroy === 'function') {
                await parser.destroy();
            }
        } else if (pdfModule && typeof pdfModule.default === 'function') {
            const data = await pdfModule.default(pdfBuffer);
            extractedText = data.text || '';
        }

        const cleanText = extractedText
            .replace(/\r\n/g, '\n')
            .replace(/\n+/g, '\n')
            .trim();

        return cleanText;
    } catch (error) {
        console.error('PDF Parsing Error:', error.message);
        throw new Error('Failed to extract text from the uploaded PDF resume');
    }
};
