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

// Add a response interceptor to handle errors globally and capture tokens
api.interceptors.response.use(
    (response) => {
        // If the response contains an access_token in the body, save it to a client-readable cookie
        // specifically for socket authentication (since the main cookie is httpOnly)
        if (response.data?.access_token) {
            document.cookie = `socket_token=${response.data.access_token}; path=/; max-age=604800; sameSite=lax`;
        }
        return response;
    },
    (error) => {
        // Handle session expiry or other global errors here
        if (error.response?.status === 401) {
            // Clear socket token on 401
            if (typeof window !== 'undefined') {
                document.cookie = 'socket_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
        return Promise.reject(error);
    }
);
