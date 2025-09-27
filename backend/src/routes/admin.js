const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeAdmin);

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, role } = req.query;

    // Build query
    let query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { panNumber: { $regex: search, $options: 'i' } }
        ];
    }

    if (role && role !== 'all') {
        query.role = role;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(query)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    // Get user statistics
    const stats = {
        totalUsers: await User.countDocuments(),
        totalAdmins: await User.countDocuments({ role: 'admin' }),
        totalRegularUsers: await User.countDocuments({ role: 'user' }),
        totalWalletBalance: await User.aggregate([
            { $group: { _id: null, total: { $sum: '$walletBalance' } } }
        ]).then(result => result[0]?.total || 0)
    };

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total,
                limit: parseInt(limit)
            },
            stats
        }
    });
}));

// @route   GET /api/admin/transactions
// @desc    Get all transactions (Admin only)
// @access  Private/Admin
router.get('/transactions', asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type, status, userId } = req.query;

    // Build query
    let query = {};

    if (type && type !== 'all') {
        query.type = type;
    }

    if (status && status !== 'all') {
        query.status = status;
    }

    if (userId) {
        query.user = userId;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find(query)
        .populate('user', 'name email')
        .populate('product', 'name symbol category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Get transaction statistics
    const stats = {
        totalTransactions: await Transaction.countDocuments(),
        totalBuyTransactions: await Transaction.countDocuments({ type: 'buy' }),
        totalSellTransactions: await Transaction.countDocuments({ type: 'sell' }),
        totalVolume: await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0)
    };

    res.json({
        success: true,
        data: {
            transactions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total,
                limit: parseInt(limit)
            },
            stats
        }
    });
}));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', asyncHandler(async (req, res) => {
    // Get overview statistics
    const [
        totalUsers,
        totalTransactions,
        totalProducts,
        totalVolume,
        recentUsers,
        recentTransactions
    ] = await Promise.all([
        User.countDocuments(),
        Transaction.countDocuments(),
        require('../models/Product').countDocuments({ isActive: true }),
        Transaction.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),
        User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
        Transaction.find()
            .populate('user', 'name email')
            .populate('product', 'name symbol')
            .sort({ createdAt: -1 })
            .limit(10)
    ]);

    // Get monthly transaction data for charts
    const monthlyData = await Transaction.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                transactions: { $sum: 1 },
                volume: { $sum: '$totalAmount' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
    ]);

    res.json({
        success: true,
        data: {
            overview: {
                totalUsers,
                totalTransactions,
                totalProducts,
                totalVolume
            },
            recentUsers,
            recentTransactions,
            monthlyData
        }
    });
}));

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/users/:id/role', asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be "user" or "admin"'
        });
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
    });
}));

module.exports = router;