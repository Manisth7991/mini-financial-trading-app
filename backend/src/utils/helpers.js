const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Validate PAN number format
const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

// Calculate portfolio summary
const calculatePortfolioSummary = (portfolioItems) => {
    let totalInvested = 0;
    let totalCurrentValue = 0;

    portfolioItems.forEach(item => {
        totalInvested += item.totalInvested;
        if (item.product && item.product.pricePerUnit) {
            totalCurrentValue += item.totalUnits * item.product.pricePerUnit;
        }
    });

    const totalReturns = totalCurrentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested * 100).toFixed(2) : 0;

    return {
        totalInvested,
        totalCurrentValue,
        totalReturns,
        returnPercentage: parseFloat(returnPercentage)
    };
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Generate transaction ID
const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TXN${timestamp}${random}`.toUpperCase();
};

// Async wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
    generateToken,
    validatePAN,
    calculatePortfolioSummary,
    formatCurrency,
    generateTransactionId,
    asyncHandler
};