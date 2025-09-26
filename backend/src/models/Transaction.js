const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },

    // Transaction Details
    type: {
        type: String,
        enum: ['buy', 'sell'],
        required: [true, 'Transaction type is required'],
        default: 'buy'
    },
    units: {
        type: Number,
        required: [true, 'Units are required'],
        min: [0.01, 'Units must be greater than 0']
    },
    pricePerUnit: {
        type: Number,
        required: [true, 'Price per unit is required'],
        min: [0.01, 'Price per unit must be greater than 0']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0.01, 'Total amount must be greater than 0']
    },

    // Transaction Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
    },

    // Additional Info
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    notes: {
        type: String,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate unique transaction ID before saving
transactionSchema.pre('save', function (next) {
    if (!this.transactionId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.transactionId = `TXN${timestamp}${random}`.toUpperCase();
    }
    next();
});

// Calculate total amount before saving
transactionSchema.pre('save', function (next) {
    this.totalAmount = this.units * this.pricePerUnit;
    next();
});

// Index for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ product: 1 });
transactionSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);