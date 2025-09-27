// Format currency to Indian Rupees
export const formatCurrency = (amount) => {
    // Handle null, undefined, or non-numeric values
    if (amount === null || amount === undefined || isNaN(amount)) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(0);
    }

    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Check again after conversion
    if (isNaN(numAmount)) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(0);
    }

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(numAmount);
};

// Format number with Indian number system
export const formatNumber = (num) => {
    // Handle null, undefined, or non-numeric values
    if (num === null || num === undefined || isNaN(num)) {
        return new Intl.NumberFormat('en-IN').format(0);
    }

    // Convert to number if it's a string
    const numValue = typeof num === 'string' ? parseFloat(num) : num;

    // Check again after conversion
    if (isNaN(numValue)) {
        return new Intl.NumberFormat('en-IN').format(0);
    }

    return new Intl.NumberFormat('en-IN').format(numValue);
};

// Format percentage
export const formatPercentage = (percentage) => {
    // Handle null, undefined, or non-numeric values
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return '0.00%';
    }

    // Convert to number if it's a string
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

    // Check again after conversion
    if (isNaN(numPercentage)) {
        return '0.00%';
    }

    const sign = numPercentage >= 0 ? '+' : '';
    return `${sign}${numPercentage.toFixed(2)}%`;
};

// Get percentage color class
export const getPercentageColor = (percentage) => {
    // Handle null, undefined, or non-numeric values
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
        return 'text-gray-500';
    }

    // Convert to number if it's a string
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

    // Check again after conversion
    if (isNaN(numPercentage)) {
        return 'text-gray-500';
    }

    return numPercentage >= 0 ? 'text-success-600' : 'text-danger-600';
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date with time
export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Validate PAN number
export const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

// Validate email
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate random ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Storage utilities
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting from storage:', error);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting to storage:', error);
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },
};

// API error handler
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 'An error occurred';
        return message;
    } else if (error.request) {
        // Request was made but no response received
        return 'Network error. Please check your connection.';
    } else {
        // Something else happened
        return 'An unexpected error occurred';
    }
};