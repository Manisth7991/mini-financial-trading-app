import api from './api';

export const authService = {
    // Register user with KYC
    signup: async (formData) => {
        const response = await api.post('/auth/signup', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Logout (client-side)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export const productService = {
    // Get all products
    getProducts: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    // Get single product
    getProduct: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Get product chart data
    getProductChart: async (id, period = '1M') => {
        const response = await api.get(`/products/${id}/chart`, {
            params: { period },
        });
        return response.data;
    },

    // Get product categories
    getCategories: async () => {
        const response = await api.get('/products/meta/categories');
        return response.data;
    },
};

export const transactionService = {
    // Buy product
    buyProduct: async (productId, units) => {
        const response = await api.post('/transactions/buy', {
            productId,
            units,
        });
        return response.data;
    },

    // Get transaction history
    getTransactions: async (params = {}) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    // Get single transaction
    getTransaction: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },
};

export const portfolioService = {
    // Get portfolio
    getPortfolio: async () => {
        const response = await api.get('/portfolio');
        return response.data;
    },

    // Get specific holding
    getHolding: async (productId) => {
        const response = await api.get(`/portfolio/holdings/${productId}`);
        return response.data;
    },

    // Get portfolio performance
    getPerformance: async (period = '1M') => {
        const response = await api.get('/portfolio/performance', {
            params: { period },
        });
        return response.data;
    },

    // Get portfolio stats
    getStats: async () => {
        const response = await api.get('/portfolio/stats');
        return response.data;
    },
};

export const watchlistService = {
    // Get watchlist
    getWatchlist: async () => {
        const response = await api.get('/watchlist');
        return response.data;
    },

    // Add to watchlist
    addToWatchlist: async (productId, notes = '') => {
        const response = await api.post(`/watchlist/add/${productId}`, { notes });
        return response.data;
    },

    // Remove from watchlist
    removeFromWatchlist: async (productId) => {
        const response = await api.delete(`/watchlist/remove/${productId}`);
        return response.data;
    },

    // Update watchlist item
    updateWatchlistItem: async (productId, notes) => {
        const response = await api.put(`/watchlist/${productId}`, { notes });
        return response.data;
    },

    // Check if in watchlist
    checkWatchlist: async (productId) => {
        const response = await api.get(`/watchlist/check/${productId}`);
        return response.data;
    },
};

// Admin service
export { default as adminService } from './adminService';