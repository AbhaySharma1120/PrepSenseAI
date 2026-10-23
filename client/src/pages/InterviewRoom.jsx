import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Award,
} from "lucide-react";

const InterviewRoom = () => {
  const navigate = useNavigate();

  // Setup state
  const [role, setRole] = useState("Full Stack MERN Engineer");
  const [difficulty, setDifficulty] = useState("Fresher / Campus Drive");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");

  // Status & Audio state
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Speech-to-Text (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Text-to-Speech (AI Speaking the question aloud)
  const speakQuestion = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech Recognition is not supported on this browser. Please use Chrome or type your answer.",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setAnswer("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Start Interview
  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError("");
    setIsInitializing(true);

    try {
      const res = await api.post("/interview/start", {
        role,
        difficulty,
        totalQuestions,
      });
      const data = res.data.data;
      setSession(data);
      setCurrentQuestion(data.currentQuestion);
      speakQuestion(data.currentQuestion.questionText);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setIsInitializing(false);
    }
  };

  // Submit Answer & Evaluate via STAR
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    if (isListening) toggleListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const res = await api.post(`/interview/${session.interviewId}/answer`, {
        answer,
      });
      const isCompleted = res.data.isCompleted ?? res.data.data?.isCompleted;
      const evaluation = res.data.data?.evaluation;
      const nextQuestion = res.data.data?.nextQuestion;

      setLastFeedback(evaluation);

      if (isCompleted) {
        setTimeout(() => {
          navigate(`/scorecard/${session.interviewId}`);
        }, 1500);
      } else {
        setCurrentQuestion(nextQuestion);
        setAnswer("");
        speakQuestion(nextQuestion.questionText);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to evaluate answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // View 1: Setup Card
  if (!session) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full p-5 sm:p-8 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              AI Mock Interview Simulator
            </h1>
            <p className="text-xs text-slate-400">
              Configure your target role and difficulty for adaptive questioning
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStartInterview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#020617] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Full Stack MERN Engineer">
                  Full Stack MERN Engineer
                </option>
                <option value="Frontend React Developer">
                  Frontend React Developer
                </option>
                <option value="Backend Node.js Engineer">
                  Backend Node.js Engineer
                </option>
                <option value="Associate Software Engineer (SDE 1)">
                  Associate Software Engineer (SDE 1)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#020617] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Fresher / Campus Drive">
                  Fresher / Campus Drive (Standard Technical & HR)
                </option>
                <option value="Junior (1-2 yrs)">
                  Junior (1-2 yrs) (Deep Technical & Tradeoffs)
                </option>
                <option value="Mid-Level (3-5 yrs)">
                  Mid-Level (System Architecture & Scalability)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Question Count
              </label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#020617] border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={3}>
                  3 Questions (Quick Practice ~ 10 mins)
                </option>
                <option value={5}>
                  5 Questions (Comprehensive Mock ~ 20 mins)
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInitializing}
              className="w-full mt-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Adaptive Questions via Gemini...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Enter Live Interview Stage
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View 2: Live Interview Stage
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono font-bold">
              {role}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {difficulty}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white"
            >
              {ttsEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              {ttsEnabled ? "AI Voice ON" : "AI Voice Muted"}
            </button>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              Question:{" "}
              <strong className="text-white">
                {currentQuestion.index + 1} of {session.totalQuestions}
              </strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Avatar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner relative">
                🤖
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping"></span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-base">
                  Alex • Senior Tech Lead
                </h3>
                <p className="text-xs text-indigo-400 font-medium">
                  Evaluating via Google Gemini
                </p>
              </div>

              {/* Animated Waveform */}
              <div className="flex items-center justify-center gap-1 h-9 px-4 rounded-xl bg-[#020617] border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 mr-2">
                  {isSpeaking ? "AI Speaking:" : "AI Listening:"}
                </span>
                <div
                  className={`w-1 bg-indigo-500 rounded-full ${isSpeaking ? "wave-bar" : "h-2"}`}
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className={`w-1 bg-indigo-400 rounded-full ${isSpeaking ? "wave-bar" : "h-3"}`}
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className={`w-1 bg-indigo-600 rounded-full ${isSpeaking ? "wave-bar" : "h-2"}`}
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className={`w-1 bg-violet-400 rounded-full ${isSpeaking ? "wave-bar" : "h-4"}`}
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>

            {/* STAR Rubric Hint */}
            <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> STAR Answer
                Strategy:
              </h4>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li>
                  <strong className="text-indigo-400">S (Situation):</strong>{" "}
                  Context or background.
                </li>
                <li>
                  <strong className="text-indigo-400">T (Task):</strong>{" "}
                  Specific objective or problem.
                </li>
                <li>
                  <strong className="text-indigo-400">A (Action):</strong>{" "}
                  Technical decisions made.
                </li>
                <li>
                  <strong className="text-indigo-400">R (Result):</strong>{" "}
                  Quantifiable impact or metric.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Question & Candidate Answer */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-6 rounded-2xl bg-[#0f172a] border-l-4 border-l-indigo-500 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {currentQuestion.category} Question
                </span>
                <button
                  onClick={() => speakQuestion(currentQuestion.questionText)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                </button>
              </div>
              <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
                "{currentQuestion.questionText}"
              </h2>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Answer:
                </label>
                {isListening && (
                  <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    Microphone Listening...
                  </span>
                )}
              </div>

              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Click 'Start Speaking' to dictate, or type your answer here..."
                className="w-full p-4 rounded-xl bg-[#020617] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              ></textarea>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isListening
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4 text-indigo-400" />
                    )}
                    {isListening ? "Stop Mic" : "Start Speaking (Mic)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnswer("")}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Evaluating
                      with STAR...
                    </>
                  ) : (
                    <>
                      Submit Answer & Next <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instant STAR Feedback */}
            {lastFeedback && (
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> STAR Evaluation for Question #
                    {currentQuestion.index}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Score: {lastFeedback.score > 10 ? `${lastFeedback.score}/100` : `${lastFeedback.score}/10`}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {lastFeedback.feedback}
                </p>
                {lastFeedback.idealAnswer && (
                  <div className="p-3 rounded-lg bg-[#020617] border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-indigo-300">
                      Senior Staff Model Answer:
                    </strong>{" "}
                    "{lastFeedback.idealAnswer}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
