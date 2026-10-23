import Resume from "../models/Resume.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { analyzeResumeWithAI } from "../services/geminiService.js";

export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    // 1. Verify file was provided by Multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume file",
      });
    }

    // 2. Verify target job description was provided
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid Job Description (minimum 20 characters)",
      });
    }

    // 3. Extract text from the PDF buffer in memory
    const extractedText = await extractTextFromPDF(req.file.buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from the PDF. Please check if the file is corrupted or an image scan.",
      });
    }

    // 4. Run Gemini AI Semantic Gap Analysis
    const aiAnalysis = await analyzeResumeWithAI(extractedText, jobDescription);

    // 5. Save the analysis report to MongoDB linked to the logged-in user
    const resumeDoc = await Resume.create({
        user: req.user._id,
        fileName: req.file.originalname,
        rawText: extractedText,
        targetJobDescription: jobDescription,
        atsScore: aiAnalysis.atsScore,
        matchingSkills: aiAnalysis.matchingSkills || [],
        missingSkills: aiAnalysis.missingSkills || [],
        summary: aiAnalysis.summary || '',
        suggestedImprovements: aiAnalysis.suggestedImprovements || [],
    });

    // 6. Return response to client
    res.status(201).json({
        success: true,
        message: 'Resume analyzed successfully!',
        data: resumeDoc,
    });
  } catch (error) {
    console.error('Resume Analysis Controller Error:', error);
    res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while analyzing resume',
    });
  }
};

export const getUserResumeHistory = async(req, res) => {
    try {
        // Fetch all resumes uploaded by the logged-in user, newest first
        const history = await Resume.find({ user: req.user._id })
        .select('-rawText') // Exclude raw text to keep response payload lightweight
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if(!resume){
            return res.status(404).json({
                success: false,
                message: 'Resume analysis report not found',
            });
        }

        res.status(200).json({
            success: true,
            data: resume,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};