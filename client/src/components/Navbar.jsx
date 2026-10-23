import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Zap,
  LayoutDashboard,
  FileText,
  Mic,
  LogOut,
  User,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null; // Hide navbar on login/register pages

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              PrepSense<span className="text-indigo-400">.ai</span>
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              MERN + Gemini
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Responsive: Icons on mobile, Icons+Text on sm+) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-800 text-xs">
          <Link
            to="/dashboard"
            title="Dashboard"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive("/dashboard") || isActive("/")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            to="/resume"
            title="ATS Analyzer"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive("/resume")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">ATS Analyzer</span>
          </Link>

          <Link
            to="/interview"
            title="Mock Interview"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              isActive("/interview")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mic className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Mock Interview</span>
          </Link>
        </nav>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">
              Gemini AI Connected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
              {user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
