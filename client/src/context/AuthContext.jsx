import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('prepsense_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('prepsense_token');
            const storedUser = localStorage.getItem('prepsense_user');

            if(storedToken && storedUser) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Login handler
    const login = async(ElementInternals, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: jwtToken, ...userData } = response.data.data;

        // Persist to local storage
        localStorage.setItem('prepsense_token', jwtToken);
        localStorage.setItem('prepsense_user', JSON.stringify(userData));

        setToken(jwtToken);
        setUser(userData);
        return response.data;
    };

    // Register handler
    const register = async(name, email, password, targetRole) => {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            targetRole,
        });
        const { token: jwtToken, ...userData } = response.data.data;

        localStorage.setItem('prepsense_token', jwtToken);
        localStorage.setItem('prepsense_user', JSON.stringify(userData));

        setToken(jwtToken);
        setUser(userData);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('prepsense_token');
        localStorage.removeItem('prepsense_user');
        setUser(null);
        setToken(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
        value={{
            user,
            token,
            loading,
            isAuthenticated: !!token,
            login,
            register,
            logout,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for consuming auth in components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}