const express = require('express');
const Watchlist = require('../models/Watchlist');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   GET /api/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
    console.log('Watchlist route: Getting watchlist for user:', req.user.id);

    try {
        const watchlist = await Watchlist.find({ user: req.user.id })
            .populate('product', 'name symbol category pricePerUnit yearHigh yearLow peRatio sector')
            .sort({ addedAt: -1 });

        console.log('Watchlist route: Found', watchlist.length, 'items');

        res.json({
            success: true,
            data: { watchlist }
        });
    } catch (error) {
        console.error('Watchlist route error:', error);
        throw error;
    }
}));

// @route   POST /api/watchlist/add/:productId
// @desc    Add product to watchlist
// @access  Private
router.post('/add/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { notes } = req.body;

    console.log('Add to watchlist: productId:', productId, 'user:', req.user.id);

    // Check if product exists
    const product = await Product.findById(productId);
    console.log('Add to watchlist: Product found:', !!product, 'isActive:', product?.isActive);

    if (!product || !product.isActive) {
        console.log('Add to watchlist: Product not found or inactive');
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Check if already in watchlist
    const existingWatchlist = await Watchlist.findOne({
        user: req.user.id,
        product: productId
    });

    if (existingWatchlist) {
        return res.status(400).json({
            success: false,
            message: 'Product already in watchlist'
        });
    }

    // Add to watchlist
    const watchlistItem = await Watchlist.create({
        user: req.user.id,
        product: productId,
        notes
    });

    // Populate product details
    await watchlistItem.populate('product', 'name symbol category pricePerUnit yearHigh yearLow peRatio sector');

    res.status(201).json({
        success: true,
        message: 'Product added to watchlist',
        data: { watchlistItem }
    });
}));

// @route   DELETE /api/watchlist/remove/:productId
// @desc    Remove product from watchlist
// @access  Private
router.delete('/remove/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const watchlistItem = await Watchlist.findOneAndDelete({
        user: req.user.id,
        product: productId
    });

    if (!watchlistItem) {
        return res.status(404).json({
            success: false,
            message: 'Product not found in watchlist'
        });
    }

    res.json({
        success: true,
        message: 'Product removed from watchlist'
    });
}));

// @route   PUT /api/watchlist/:productId
// @desc    Update watchlist item notes
// @access  Private
router.put('/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { notes } = req.body;

    const watchlistItem = await Watchlist.findOneAndUpdate(
        { user: req.user.id, product: productId },
        { notes },
        { new: true, runValidators: true }
    ).populate('product', 'name symbol category pricePerUnit yearHigh yearLow peRatio sector');

    if (!watchlistItem) {
        return res.status(404).json({
            success: false,
            message: 'Product not found in watchlist'
        });
    }

    res.json({
        success: true,
        message: 'Watchlist item updated',
        data: { watchlistItem }
    });
}));

// @route   GET /api/watchlist/check/:productId
// @desc    Check if product is in user's watchlist
// @access  Private
router.get('/check/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const watchlistItem = await Watchlist.findOne({
        user: req.user.id,
        product: productId
    });

    res.json({
        success: true,
        data: {
            inWatchlist: !!watchlistItem,
            watchlistItem: watchlistItem || null
        }
    });
}));

module.exports = router;