const express = require('express');
const Product = require('../models/Product');
const { asyncHandler } = require('../utils/helpers');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const { category, search, sort = 'name', limit = 10, page = 1 } = req.query;

    // Build query
    let query = { isActive: true };

    // Filter by category
    if (category && category !== 'all') {
        query.category = category;
    }

    // Search functionality
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { symbol: { $regex: search, $options: 'i' } },
            { sector: { $regex: search, $options: 'i' } }
        ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    let sortOption = {};
    switch (sort) {
        case 'price_low':
            sortOption = { pricePerUnit: 1 };
            break;
        case 'price_high':
            sortOption = { pricePerUnit: -1 };
            break;
        case 'name':
            sortOption = { name: 1 };
            break;
        case 'latest':
            sortOption = { createdAt: -1 };
            break;
        default:
            sortOption = { name: 1 };
    }

    // Execute query
    const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
        success: true,
        data: {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }
    });
}));

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: { product }
    });
}));

// @route   GET /api/products/:id/chart
// @desc    Get product chart data
// @access  Public
router.get('/:id/chart', asyncHandler(async (req, res) => {
    const { period = '1M' } = req.query;

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    // Filter historical prices based on period
    let filteredPrices = product.historicalPrices;
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

    filteredPrices = product.historicalPrices.filter(price => price.date >= startDate);

    // Add current price as the latest data point
    filteredPrices.push({
        date: now,
        price: product.pricePerUnit
    });

    res.json({
        success: true,
        data: {
            symbol: product.symbol,
            name: product.name,
            currentPrice: product.pricePerUnit,
            period,
            chartData: filteredPrices
        }
    });
}));

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/meta/categories', asyncHandler(async (req, res) => {
    const categories = await Product.distinct('category', { isActive: true });

    res.json({
        success: true,
        data: { categories }
    });
}));

module.exports = router;