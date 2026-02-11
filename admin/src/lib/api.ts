import axios from 'axios';

// For browser requests, we need to use localhost, not the Docker internal hostname
const NEXT_PUBLIC_API_URL = typeof window !== 'undefined'
    ? 'http://localhost:4000'  // Browser: use localhost (no /api prefix)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'); // Server: can use env var

export const api = axios.create({
    baseURL: NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Admin session expired or unauthorized');
        }
        return Promise.reject(error);
    }
);
