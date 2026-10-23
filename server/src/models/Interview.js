import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'Technical',
    },
    userAnswer: {
        type: String,
        default: '',
    },
    evaluation: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        feedback: { type: String, default: '' },
        starBreakdown: {
            situation: { type: String, default: '' },
            task: { type: String, default: '' },
            action: { type: String, default: '' },
            result: { type: String, default: '' },
        },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        improvements: [{ type: String }],
        idealAnswer: { type: String, default: '' },
    },
});

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            required: true,
            default: 'Full Stack MERN Engineer',
        },
        difficulty: {
            type: String,
            default: 'Fresher / Campus Drive', 
        },
        status: {
            type: String,
            enum: ['in-progress', 'completed', 'aborted'],
            default: 'in-progress',
        },
        currentQuestionIndex: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            default: 5,
        },
        questions: [questionSchema],
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        radarMetrics: {
            technicalDepth: { type: Number, default: 8 },
            problemSolving: { type: Number, default: 8 },
            communication: { type: Number, default: 8 },
            starAlignment: { type: Number, default: 8 },
            starStructure: { type: Number, default: 8 },
            systemArchitecture: { type: Number, default: 8 },
        },
        finalSummary: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
