import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Heart, Eye, X, TrendingUp, TrendingDown } from 'lucide-react';
import { watchlistService } from '../services';
import { formatCurrency, formatPercentage, getPercentageColor } from '../utils/helpers';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const response = await watchlistService.getWatchlist();
            setWatchlist(response.data.watchlist);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            toast.error('Failed to fetch watchlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchlist = async (productId) => {
        try {
            await watchlistService.removeFromWatchlist(productId);
            setWatchlist(prev => prev.filter(item => item.product._id !== productId));
            toast.success('Removed from watchlist');
        } catch (error) {
            toast.error('Failed to remove from watchlist');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist</h1>
                <p className="text-gray-600">Keep track of your favorite investment opportunities</p>
            </div>

            {watchlist.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Your watchlist is empty</h3>
                    <p className="text-gray-600 mb-6">Start adding products to track their performance</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {watchlist.map((item) => {
                        const product = item.product;
                        if (!product) return null; // Skip if product is null/undefined

                        const returnPercentage = product.returnPercentage || 0;
                        const isPositive = returnPercentage >= 0;

                        return (
                            <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {product.symbol} • {product.category}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromWatchlist(product._id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Remove from watchlist"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(product.pricePerUnit)}
                                        </span>
                                        <div className={`flex items-center ${getPercentageColor(returnPercentage)}`}>
                                            {isPositive ? (
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 mr-1" />
                                            )}
                                            <span className="font-medium">
                                                {formatPercentage(returnPercentage)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">52W High:</span>
                                        <p className="font-medium">{product.yearHigh ? formatCurrency(product.yearHigh) : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">52W Low:</span>
                                        <p className="font-medium">{product.yearLow ? formatCurrency(product.yearLow) : 'N/A'}</p>
                                    </div>
                                    {product.peRatio && (
                                        <>
                                            <div>
                                                <span className="text-gray-600">P/E Ratio:</span>
                                                <p className="font-medium">{product.peRatio}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Sector:</span>
                                                <p className="font-medium">{product.sector || 'N/A'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {item.notes && (
                                    <div className="mb-4">
                                        <span className="text-gray-600 text-sm">Notes:</span>
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">
                                            {item.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Added {new Date(item.addedAt).toLocaleDateString()}
                                    </span>
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Watchlist;