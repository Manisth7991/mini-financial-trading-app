import axios from 'axios';
import { storage } from '../utils/helpers';

const API_URL = process.env.REACT_APP_API_URL || 'https://mini-financial-trading-app-backend.onrender.com/api';

// Create axios instance with enhanced config for admin operations
const adminApi = axios.create({
    baseURL: `${API_URL}/admin`,
    timeout: 60000, // 60 seconds timeout for admin operations and cold starts
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Add token to requests
adminApi.interceptors.request.use(
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

// Handle responses and errors
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Admin API Error:', error.response?.data || error.message);

        // Handle 401 errors (token expired/invalid)
        if (error.response?.status === 401) {
            storage.remove('token');
            storage.remove('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export const adminService = {
    // Dashboard
    getDashboard: () => adminApi.get('/dashboard'),

    // Users
    getUsers: (params = {}) => adminApi.get('/users', { params }),
    updateUserRole: (userId, role) => adminApi.put(`/users/${userId}/role`, { role }),

    // Transactions
    getTransactions: (params = {}) => adminApi.get('/transactions', { params }),
};

export default adminService;