const express = require('express');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { generateToken, validatePAN, asyncHandler } = require('../utils/helpers');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register user with KYC
// @access  Public
router.post('/signup', upload.single('idImage'), asyncHandler(async (req, res) => {
    const { name, email, password, panNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !panNumber) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
    }

    // Validate file upload
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'ID image is required'
        });
    }

    // Validate PAN format
    if (!validatePAN(panNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid PAN number'
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { panNumber }]
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: existingUser.email === email ? 'Email already exists' : 'PAN number already exists'
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        panNumber: panNumber.toUpperCase(),
        idImagePath: req.file.path
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                panNumber: user.panNumber,
                walletBalance: user.walletBalance,
                isKYCVerified: user.isKYCVerified,
                role: user.role
            },
            token
        }
    });
}));

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                panNumber: user.panNumber,
                walletBalance: user.walletBalance,
                isKYCVerified: user.isKYCVerified,
                role: user.role,
                lastLogin: user.lastLogin
            },
            token
        }
    });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').authenticateToken, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                panNumber: user.panNumber,
                walletBalance: user.walletBalance,
                isKYCVerified: user.isKYCVerified,
                role: user.role,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        }
    });
}));

module.exports = router;