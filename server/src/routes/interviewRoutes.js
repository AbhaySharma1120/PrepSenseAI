import express from 'express';
import {
    startInterview,
    submitAnswer,
    getInterviewById,
    getUserInterviews,
} from '../controllers/interviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/:id/answer', protect, submitAnswer);
router.get('/history', protect, getUserInterviews);
router.get('/:id', protect, getInterviewById);

export default router;