import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        rawText: {
            type: String,
            required: true,
        },
        targetJobDescription: {
            type: String,
            required: true,
        },
        atsScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        matchingSkills: [
            {
                type: String,
            },
        ],
        missingSkills: [
            {
                skill: { type: String, required: true },
                importance: {
                    type: String,
                    enum: ['High', 'Medium', 'Low'],
                    default: 'Medium',
                },
            },
        ],
        summary: {
            type: String,
            required: true,
        },
        suggestedImprovements: [
            {
                originalPoint: { type: String },
                improvedPoint: { type: String },
                reason: { type: String },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;