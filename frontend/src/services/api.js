import axios from 'axios';
import { storage } from '../utils/helpers';

// Create axios instance with enhanced configuration for deployment
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://mini-financial-trading-app-backend.onrender.com/api',
    timeout: 60000, // 60 seconds timeout for Render cold starts and slow operations
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = storage.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            storage.remove('token');
            storage.remove('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;