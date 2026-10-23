import axios from "axios";

// centralized Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Automatically injects JWT Bearer token into headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('prepsense_token');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Catches 401s (expired session) and handles errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response && error.response.status === 401) {
            localStorage.removeItem('prepsense_token');
            localStorage.removeItem('prepsense_user');

            if(window.location.pathname !== '/login'){
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;