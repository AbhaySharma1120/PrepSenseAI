import express from 'express';
import {
    analyzeResume,
    getUserResumeHistory,
    getResumeById,
} from '../controllers/resumeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, upload.single('resume'), analyzeResume);
router.get('/history', protect, getUserResumeHistory);
router.get('/:id', protect, getResumeById);

export default router;