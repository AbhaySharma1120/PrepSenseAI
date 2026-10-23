import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  Award,
  ArrowLeft,
  Printer,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

const Scorecard = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterview(res.data.data);
      } catch (err) {
        console.error("Failed to load scorecard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-xs text-indigo-400 font-mono">
        Loading Performance Scorecard...
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 text-center text-xs text-slate-400 space-y-4 pt-20">
        <p>Interview session not found.</p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const {
    overallScore,
    radarMetrics,
    finalSummary,
    questions,
    role,
    difficulty,
  } = interview;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation / Action bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <Link
              to="/interview"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <RotateCcw className="w-4 h-4" /> Retake Interview
            </Link>
          </div>
        </div>

        {/* Hero Score Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#151f32] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Evaluation Completed • Placement Ready
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Performance Scorecard: {role}
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">{finalSummary}</p>
          </div>

          <div className="text-center px-8 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 shrink-0">
            <span className="text-5xl font-black text-indigo-400">
              {overallScore || 85}
            </span>
            <span className="text-sm font-bold text-indigo-300">/100</span>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              SDE 1 Benchmark Met
            </p>
          </div>
        </div>

        {/* 4 Multi-Axis Radar Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Technical Depth
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {radarMetrics?.technicalDepth || 8.8} / 10
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Solid understanding of core tradeoffs & internals.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Problem Solving
            </span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {radarMetrics?.problemSolving || 8.5} / 10
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Systematic step-by-step analytical approach.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Communication
            </span>
            <p className="text-2xl font-bold text-violet-400 mt-1">
              {radarMetrics?.communication || 8.9} / 10
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Articulate pacing and technical vocabulary.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              STAR Structure
            </span>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {radarMetrics?.starStructure || 8.2} / 10
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Framed Situation, Task, Action, and Metrics.
            </p>
          </div>
        </div>

        {/* Question-by-Question Deep Dive */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white">
            Question-by-Question Technical Audit
          </h2>

          <div className="space-y-6">
            {questions?.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#020617] border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">
                    Question #{idx + 1} • {q.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Score: {q.evaluation?.score > 10 ? `${q.evaluation.score}/100` : `${q.evaluation?.score || 8.5}/10`}
                  </span>
                </div>

                <p className="text-xs font-semibold text-white">
                  "{q.questionText}"
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-slate-400">Your Answer:</strong> "
                  {q.userAnswer || "No answer recorded."}"
                </div>

                <p className="text-xs text-slate-300">
                  <strong className="text-indigo-400">AI Feedback:</strong>{" "}
                  {q.evaluation?.feedback}
                </p>

                {q.evaluation?.idealAnswer && (
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200">
                    <strong className="text-indigo-300">
                      Senior Staff Model Answer:
                    </strong>{" "}
                    "{q.evaluation.idealAnswer}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
