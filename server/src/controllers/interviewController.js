import Interview from "../models/Interview.js";
import {
  generateInterviewQuestions,
  evaluateAnswerWithSTAR,
  generateFinalScorecard,
} from "../services/geminiService.js";

export const startInterview = async (req, res) => {
  try {
    const { role, difficulty, totalQuestions = 5 } = req.body;

    const targetRole = role || "Full Stack MERN Engineer";
    const targetDifficulty = difficulty || "Fresher / Campus Drive";

    // 1. Call Gemini to generate adaptive questions tailored to the role
    const generateQuestions = await generateInterviewQuestions(
      targetRole,
      targetDifficulty,
      Number(totalQuestions),
    );

    // 2. Format questions for our Mongoose schema
    const formattedQuestions = generateQuestions.slice(0, Number(totalQuestions) || 5).map((q) => ({
      questionText: q.questionText,
      category: q.category || "Technical",
      userAnswer: "",
      evaluation: {},
    }));

    // 3. Save new interview session in MongoDB
    const interview = await Interview.create({
      user: req.user._id,
      role: targetRole,
      difficulty: targetDifficulty,
      totalQuestions: formattedQuestions.length,
      currentQuestionIndex: 0,
      status: "in-progress",
      questions: formattedQuestions,
    });

    // 4. Return the session ID and the first question
    res.status(201).json({
      success: true,
      message: "Interview session initialized!",
      data: {
        interviewId: interview._id,
        role: interview.role,
        difficulty: interview.difficulty,
        totalQuestions: interview.totalQuestions,
        currentQuestionIndex: 0,
        currentQuestion: {
          index: 0,
          questionText: interview.questions[0].questionText,
          category: interview.questions[0].category,
        },
      },
    });
  } catch (error) {
    console.error("Start Interview Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "False to start interview session",
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an answer (via voice or text)",
      });
    }

    // 1. Fetch current interview session
    const interview = await Interview.findOne({ _id: id, user: req.user._id });

    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview session not found" });
    }

    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview has already been completed",
      });
    }

    const currentIndex = interview.currentQuestionIndex;
    const activeQuestion = interview.questions[currentIndex];

    // 2. Evaluate answer using Gemini STAR Rubric
    const evaluation = await evaluateAnswerWithSTAR(
      activeQuestion.questionText,
      answer,
      activeQuestion.category,
      interview.role,
    );

    // 3. Save candidate answer & evaluation to the active question
    activeQuestion.userAnswer = answer;
    activeQuestion.evaluation = evaluation;

    // 4. Check if this was the last question
    const isLastQuestion = currentIndex + 1 >= interview.questions.length;

    if (isLastQuestion) {
      // INTERVIEW FINISHED: Generate final scorecard
      interview.status = "completed";
      interview.currentQuestionIndex = currentIndex + 1;

      const finalScorecard = await generateFinalScorecard(
        interview.questions,
        interview.role,
      );

      interview.overallScore = finalScorecard.overallScore;
      interview.radarMetrics = finalScorecard.radarMetrics;
      interview.finalSummary = finalScorecard.finalSummary;

      await interview.save();

      return res.status(200).json({
        success: true,
        isCompleted: true,
        message: "Interview completed! Final scorecard generated",
        data: {
          isCompleted: true,
          evaluation, // Feedback for the last question
          finalScorecard: {
            overallScore: interview.overallScore,
            radarMetrics: interview.radarMetrics,
            finalSummary: interview.finalSummary,
          },
          interview,
        },
      });
    } else {
        // ADVANCE TO NEXT QUESTION
        interview.currentQuestionIndex = currentIndex + 1;
        await interview.save();

        const nextQ = interview.questions[interview.currentQuestionIndex];

        return res.status(200).json({
            success: true,
            isCompleted: false,
            message: 'Answer evaluated successfully! Ready for next question',
            data: {
                isCompleted: false,
                evaluation, // Instant feedback on the question just answered
                nextQuestion: {
                    index: interview.currentQuestionIndex,
                    questionText: nextQ.questionText,
                    category: nextQ.category,
                    totalQuestions: interview.totalQuestions,
                },
            },
        });
    }
  } catch (error) {
    console.error('Submit Answer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to evaluate answer',
    });
  }
};

export const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

        if(!interview){
            return res.status(404).json({ success: false, message: 'Interview session not found' });
        }

        res.status(200).json({ success: true, data: interview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserInterviews = async (req, res) => {
    try {
        const history = await Interview.find({ user: req.user._id })
        .select('role difficulty status overallScore createdAt totalQuestions')
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};