const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },

    // KYC Information
    panNumber: {
        type: String,
        required: [true, 'PAN number is required'],
        unique: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
            },
            message: 'Please provide a valid PAN number'
        }
    },
    idImagePath: {
        type: String,
        required: [true, 'ID image is required']
    },

    // Financial Info
    walletBalance: {
        type: Number,
        default: 100000, // Starting with ₹1,00,000
        min: [0, 'Wallet balance cannot be negative']
    },

    // Account Status
    isKYCVerified: {
        type: Boolean,
        default: true // For demo purposes, auto-verify
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);