const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/transactions/buy
// @desc    Buy a product
// @access  Private
router.post('/buy', asyncHandler(async (req, res) => {
    const { productId, units } = req.body;

    // Validate input
    if (!productId || !units || units <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid product ID and units'
        });
    }

    // Get product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Calculate total amount
    const totalAmount = units * product.pricePerUnit;

    // Check user's wallet balance
    const user = await User.findById(req.user.id);
    if (user.walletBalance < totalAmount) {
        return res.status(400).json({
            success: false,
            message: 'Insufficient wallet balance'
        });
    }

    // Start transaction session
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
        // Deduct amount from wallet
        await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { walletBalance: -totalAmount } },
            { session }
        );

        // Create transaction record
        const transaction = await Transaction.create([{
            user: req.user.id,
            product: productId,
            type: 'buy',
            units,
            pricePerUnit: product.pricePerUnit,
            totalAmount,
            status: 'completed'
        }], { session });

        // Update or create portfolio entry
        const existingPortfolio = await Portfolio.findOne({
            user: req.user.id,
            product: productId
        }).session(session);

        if (existingPortfolio) {
            // Update existing portfolio
            const newTotalUnits = existingPortfolio.totalUnits + units;
            const newTotalInvested = existingPortfolio.totalInvested + totalAmount;
            const newAveragePrice = newTotalInvested / newTotalUnits;

            await Portfolio.findByIdAndUpdate(
                existingPortfolio._id,
                {
                    totalUnits: newTotalUnits,
                    averagePrice: newAveragePrice,
                    totalInvested: newTotalInvested
                },
                { session }
            );
        } else {
            // Create new portfolio entry
            await Portfolio.create([{
                user: req.user.id,
                product: productId,
                totalUnits: units,
                averagePrice: product.pricePerUnit,
                totalInvested: totalAmount,
                firstPurchaseDate: new Date()
            }], { session });
        }

        await session.commitTransaction();

        // Get updated user balance
        const updatedUser = await User.findById(req.user.id);

        res.status(201).json({
            success: true,
            message: 'Purchase completed successfully',
            data: {
                transaction: transaction[0],
                newWalletBalance: updatedUser.walletBalance
            }
        });

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}));

// @route   GET /api/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, status } = req.query;

    // Build query
    let query = { user: req.user.id };

    if (type) query.type = type;
    if (status) query.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find(query)
        .populate('product', 'name symbol category pricePerUnit')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.json({
        success: true,
        data: {
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
}));

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user.id
    }).populate('product', 'name symbol category pricePerUnit');

    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: 'Transaction not found'
        });
    }

    res.json({
        success: true,
        data: { transaction }
    });
}));

module.exports = router;