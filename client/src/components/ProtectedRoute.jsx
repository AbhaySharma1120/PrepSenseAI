import React from "react";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if(loading) {
        return(
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex items-center gap-3 text-indigo-400">
                    <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-sm font-mono">Authenticating...</span>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;