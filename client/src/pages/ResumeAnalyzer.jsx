import React, { useState } from "react";
import api from "../services/api";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(
    "Looking for an Associate Full Stack Engineer proficient in React, Node.js, Express, MongoDB, and Redis caching. Experience with RESTful APIs, Docker, and CI/CD pipelines is preferred.",
  );
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF resume to analyze.");
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      setError(
        "Please provide a target job description (minimum 20 characters).",
      );
      return;
    }

    setError("");
    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await api.post("/resume/analyze", formData);



      setResult(response.data.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to analyze resume. Please try again.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
            Gemini ATS Copilot
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ATS Resume & Job Description Gap Analyzer
          </h1>
          <p className="text-xs text-slate-400">
            Extract skills in-memory, compare against target JDs, and receive
            Google X-Y-Z bullet rewrites.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & JD Input */}
          <div className="lg:col-span-6 space-y-6">
            <form onSubmit={handleAnalyze} className="space-y-6">
              {/* PDF Upload Card */}
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> 1. Upload PDF
                  Resume
                </h2>

                <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#020617]/50 block">
                  <UploadCloud className="w-10 h-10 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-white">
                    {file
                      ? file.name
                      : "Click to browse or drop your PDF resume here"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    PDF format up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected:{" "}
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Job Description Input Card */}
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white">
                  2. Paste Target Job Description (JD)
                </h2>
                <textarea
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements from LinkedIn or campus drive notice..."
                  className="w-full p-3.5 rounded-xl bg-[#020617] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed font-mono"
                ></textarea>

                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Semantic ATS Analysis
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: AI Analysis Results */}
          <div className="lg:col-span-6 space-y-6">
            {!result ? (
              <div className="p-12 rounded-2xl bg-[#0f172a] border border-slate-800 text-center space-y-3 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <h3 className="text-sm font-bold text-white">
                  No Analysis Generated Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Upload your PDF resume and paste a job description on the left
                  to view your ATS score and keyword gap analysis.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-6 animate-fadeIn">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase">
                      Evaluation Report
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      ATS Semantic Match
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      {result.summary}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-extrabold text-indigo-400">
                      {result.atsScore}%
                    </span>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                      {result.atsScore >= 75
                        ? "Strong Candidate"
                        : "Moderate Match"}
                    </p>
                  </div>
                </div>

                {/* Missing Skills (Gaps) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Identified Skill Gaps (Not found in Resume):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills?.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        ❌ {item.skill || item} ({item.importance || "High"})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Validated Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Validated Matching Skills:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Improvements */}
                {result.suggestedImprovements?.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini X-Y-Z Bullet
                      Point Optimizer
                    </h4>
                    {result.suggestedImprovements
                      .slice(0, 2)
                      .map((item, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <p className="text-slate-400">
                            <strong className="text-amber-300">
                              Original:
                            </strong>{" "}
                            "{item.originalPoint}"
                          </p>
                          <p className="text-slate-200">
                            <strong className="text-emerald-400">
                              Rewritten:
                            </strong>{" "}
                            "{item.improvedPoint}"
                          </p>
                          <p className="text-[11px] text-indigo-400 italic">
                            Why: {item.reason}
                          </p>
                        </div>
                      ))}
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

export default ResumeAnalyzer;
