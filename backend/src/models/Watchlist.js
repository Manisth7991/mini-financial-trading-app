const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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

    // Additional Info
    addedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [100, 'Notes cannot exceed 100 characters']
    }
});

// Ensure a user can't add the same product twice to watchlist
watchlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for better query performance
watchlistSchema.index({ user: 1, addedAt: -1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);