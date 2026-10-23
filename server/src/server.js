import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import InterviewRoutes from './routes/interviewRoutes.js';

connectDB();

const app = express();

app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', InterviewRoutes);

app.get(`/api/health`, (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'PrepSense AI Backend is running smoothly',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`PrepSense AI Server listening on http://localhost:${PORT}`);
});