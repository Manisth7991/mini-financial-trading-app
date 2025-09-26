const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
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

    // Holdings
    totalUnits: {
        type: Number,
        required: [true, 'Total units are required'],
        min: [0, 'Total units cannot be negative'],
        default: 0
    },
    averagePrice: {
        type: Number,
        required: [true, 'Average price is required'],
        min: [0.01, 'Average price must be greater than 0']
    },
    totalInvested: {
        type: Number,
        required: [true, 'Total invested amount is required'],
        min: [0, 'Total invested cannot be negative']
    },

    // Timestamps
    firstPurchaseDate: {
        type: Date,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can have only one portfolio entry per product
portfolioSchema.index({ user: 1, product: 1 }, { unique: true });

// Calculate total invested before saving
portfolioSchema.pre('save', function (next) {
    this.totalInvested = this.totalUnits * this.averagePrice;
    this.lastUpdated = Date.now();
    next();
});

// Virtual for current value (requires product price to be populated)
portfolioSchema.virtual('currentValue').get(function () {
    if (this.product && this.product.pricePerUnit) {
        return this.totalUnits * this.product.pricePerUnit;
    }
    return 0;
});

// Virtual for returns
portfolioSchema.virtual('returns').get(function () {
    const currentValue = this.currentValue;
    return currentValue - this.totalInvested;
});

// Virtual for return percentage
portfolioSchema.virtual('returnPercentage').get(function () {
    if (this.totalInvested === 0) return 0;
    const returns = this.returns;
    return (returns / this.totalInvested * 100).toFixed(2);
});

// Ensure virtual fields are serialized
portfolioSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);