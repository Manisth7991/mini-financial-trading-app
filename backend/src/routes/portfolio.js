const express = require('express');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { calculatePortfolioSummary, asyncHandler } = require('../utils/helpers');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
    // Get user's portfolio with product details
    const portfolioItems = await Portfolio.find({ user: req.user.id })
        .populate('product', 'name symbol category pricePerUnit yearHigh yearLow')
        .sort({ lastUpdated: -1 });

    // Get user's current wallet balance
    const user = await User.findById(req.user.id);

    // Calculate portfolio summary
    const summary = calculatePortfolioSummary(portfolioItems);

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user: req.user.id })
        .populate('product', 'name symbol')
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
        success: true,
        data: {
            summary: {
                ...summary,
                walletBalance: user.walletBalance,
                totalValue: summary.totalCurrentValue + user.walletBalance
            },
            holdings: portfolioItems,
            recentTransactions
        }
    });
}));

// @route   GET /api/portfolio/holdings/:productId
// @desc    Get specific holding details
// @access  Private
router.get('/holdings/:productId', asyncHandler(async (req, res) => {
    const holding = await Portfolio.findOne({
        user: req.user.id,
        product: req.params.productId
    }).populate('product', 'name symbol category pricePerUnit yearHigh yearLow sector description');

    if (!holding) {
        return res.status(404).json({
            success: false,
            message: 'Holding not found'
        });
    }

    // Get transactions for this product
    const transactions = await Transaction.find({
        user: req.user.id,
        product: req.params.productId
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: {
            holding,
            transactions
        }
    });
}));

// @route   GET /api/portfolio/performance
// @desc    Get portfolio performance data
// @access  Private
router.get('/performance', asyncHandler(async (req, res) => {
    const { period = '1M' } = req.query;

    // Get user's portfolio
    const portfolioItems = await Portfolio.find({ user: req.user.id })
        .populate('product', 'name symbol pricePerUnit historicalPrices');

    // Calculate performance based on period
    const now = new Date();
    let startDate;

    switch (period) {
        case '1W':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '1M':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '3M':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case '6M':
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
        case '1Y':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate daily portfolio values
    const performanceData = [];
    const daysInPeriod = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));

    for (let i = daysInPeriod; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        let totalValue = 0;

        portfolioItems.forEach(item => {
            if (item.product && item.product.historicalPrices) {
                // Find closest historical price
                let closestPrice = item.product.pricePerUnit;
                let minTimeDiff = Infinity;

                item.product.historicalPrices.forEach(priceData => {
                    const timeDiff = Math.abs(priceData.date - date);
                    if (timeDiff < minTimeDiff) {
                        minTimeDiff = timeDiff;
                        closestPrice = priceData.price;
                    }
                });

                totalValue += item.totalUnits * closestPrice;
            }
        });

        performanceData.push({
            date: date.toISOString().split('T')[0],
            value: totalValue
        });
    }

    res.json({
        success: true,
        data: {
            period,
            performanceData,
            currentValue: calculatePortfolioSummary(portfolioItems).totalCurrentValue
        }
    });
}));

// @route   GET /api/portfolio/stats
// @desc    Get portfolio statistics
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
    const portfolioItems = await Portfolio.find({ user: req.user.id })
        .populate('product', 'name symbol category pricePerUnit');

    // Calculate statistics
    const summary = calculatePortfolioSummary(portfolioItems);

    // Category breakdown
    const categoryBreakdown = {};
    portfolioItems.forEach(item => {
        if (item.product) {
            const category = item.product.category;
            const currentValue = item.totalUnits * item.product.pricePerUnit;

            if (!categoryBreakdown[category]) {
                categoryBreakdown[category] = {
                    category,
                    value: 0,
                    percentage: 0,
                    count: 0
                };
            }

            categoryBreakdown[category].value += currentValue;
            categoryBreakdown[category].count += 1;
        }
    });

    // Calculate percentages
    Object.values(categoryBreakdown).forEach(category => {
        category.percentage = summary.totalCurrentValue > 0
            ? (category.value / summary.totalCurrentValue * 100).toFixed(2)
            : 0;
    });

    // Top performers
    const performers = portfolioItems
        .map(item => ({
            product: item.product,
            returns: item.returns,
            returnPercentage: item.returnPercentage,
            currentValue: item.currentValue
        }))
        .sort((a, b) => b.returnPercentage - a.returnPercentage)
        .slice(0, 5);

    res.json({
        success: true,
        data: {
            summary,
            categoryBreakdown: Object.values(categoryBreakdown),
            topPerformers: performers,
            totalHoldings: portfolioItems.length
        }
    });
}));

module.exports = router;