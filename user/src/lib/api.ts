import axios from 'axios';

// For browser requests, we need to use localhost, not the Docker internal hostname
// The NEXT_PUBLIC_ prefix makes this available to the browser
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

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expiry or other global errors here
        if (error.response?.status === 401) {
            // Potentially redirect to login or clear auth state
            console.error('Session expired or unauthorized');
        }
        return Promise.reject(error);
    }
);
