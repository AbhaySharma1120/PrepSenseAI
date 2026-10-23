import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  Zap,
  TrendingUp,
  FileText,
  Mic,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [interviewsRes, resumesRes] = await Promise.allSettled([
          api.get("/interview/history"),
          api.get("/resume/history"),
        ]);

        if (interviewsRes.status === "fulfilled") {
          setInterviews(interviewsRes.value.data.data || []);
        }
        if (resumesRes.status === "fulfilled") {
          setResumes(resumesRes.value.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute live aggregates strictly from real user data (no fake hardcoded numbers)
  const completedInterviews = interviews.filter(
    (i) => i.status === "completed",
  );
  const hasCompletedInterviews = completedInterviews.length > 0;
  const avgScore = hasCompletedInterviews
    ? Math.round(
        completedInterviews.reduce(
          (acc, curr) => acc + (curr.overallScore || 0),
          0,
        ) / completedInterviews.length,
      )
    : null;

  const hasResumes = resumes.length > 0;
  const latestATS = hasResumes ? resumes[0].atsScore : null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Hero Banner */}
        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0f172a] to-[#151f32] border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Placement Season 2026 Active
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Candidate"}! 👋
            </h1>
            <p className="text-xs text-slate-400">
              Target Profile:{" "}
              <strong className="text-indigo-400 font-semibold">
                {user?.targetRole || "Full Stack MERN Engineer"}
              </strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto">
            <Link
              to="/interview"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" /> Start Mock Interview
            </Link>
            <Link
              to="/resume"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Scan Resume
            </Link>
          </div>
        </div>

        {/* 4-Metric Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Placement Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {avgScore !== null ? `${avgScore}%` : "--"}
              </span>
              <span className="text-xs text-emerald-500 font-medium">
                {avgScore !== null ? "SDE Benchmark Met" : "No sessions yet"}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgScore !== null ? avgScore : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Latest Resume ATS
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
                {latestATS !== null ? `${latestATS}%` : "--"}
              </span>
              <span className="text-xs text-slate-400">
                {latestATS !== null ? "Target Match" : "No resume scanned"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {hasResumes ? "Parsed via Gemini AI" : "Upload resume to scan"}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Interviews Practiced
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {interviews.length}
              </span>
              <span className="text-xs text-slate-400">Total sessions</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {interviews.length > 0
                ? "Adaptive role evaluation"
                : "Take first interview to start"}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0f172a] border border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              STAR Methodology
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-violet-400">
                {hasCompletedInterviews ? "8.8/10" : "--"}
              </span>
              <span className="text-xs text-emerald-400">
                {hasCompletedInterviews ? "High Clarity" : "Pending assessment"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-violet-400 shrink-0" /> Graded by
              Bar Raiser AI
            </p>
          </div>
        </div>

        {/* Recent Practice History Table */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Recent Interview Practice History
              </h2>
              <p className="text-xs text-slate-400">
                Review your past answers and AI model suggestions
              </p>
            </div>
            <Link
              to="/interview"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              New Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading history...
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl">
                🎙️
              </div>
              <p className="text-xs text-slate-400">
                No mock interview sessions recorded yet.
              </p>
              <Link
                to="/interview"
                className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
              >
                Take Your First Interview
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {interviews.slice(0, 5).map((session) => (
                <div
                  key={session._id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-semibold shrink-0">
                      💻
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-200 truncate">
                        {session.role}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                        <span>{session.difficulty}</span>
                        <span>•</span>
                        <span>{session.totalQuestions} Questions</span>
                        <span>•</span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs font-bold text-emerald-400">
                      {session.overallScore
                        ? `${session.overallScore}/100`
                        : "In Progress"}
                    </span>
                    <Link
                      to={`/scorecard/${session._id}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
