const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    symbol: {
        type: String,
        required: [true, 'Product symbol is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['stock', 'mutual_fund', 'etf', 'bond'],
        lowercase: true
    },
    pricePerUnit: {
        type: Number,
        required: [true, 'Price per unit is required'],
        min: [0.01, 'Price must be greater than 0']
    },

    // Key Metrics
    peRatio: {
        type: Number,
        min: [0, 'P/E ratio cannot be negative']
    },
    marketCap: {
        type: Number,
        min: [0, 'Market cap cannot be negative']
    },
    yearHigh: {
        type: Number,
        min: [0, 'Year high cannot be negative']
    },
    yearLow: {
        type: Number,
        min: [0, 'Year low cannot be negative']
    },

    // Additional Info
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    sector: {
        type: String,
        trim: true
    },

    // Performance Data (for charts)
    historicalPrices: [{
        date: {
            type: Date,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative']
        }
    }],

    // Status
    isActive: {
        type: Boolean,
        default: true
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for current return percentage
productSchema.virtual('returnPercentage').get(function () {
    if (this.historicalPrices.length < 2) return 0;

    const firstPrice = this.historicalPrices[0].price;
    const currentPrice = this.pricePerUnit;

    return ((currentPrice - firstPrice) / firstPrice * 100).toFixed(2);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);