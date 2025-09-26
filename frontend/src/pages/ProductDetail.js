import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    Heart,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Info,
    Calendar,
    BarChart3
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { productService, watchlistService, transactionService } from '../services';
import {
    formatCurrency,
    formatPercentage,
    getPercentageColor,
    formatDate
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateWalletBalance } = useAuth();

    const [product, setProduct] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [period, setPeriod] = useState('1M');
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [buyUnits, setBuyUnits] = useState(1);
    const [buyLoading, setBuyLoading] = useState(false);

    const periods = [
        { value: '1W', label: '1W' },
        { value: '1M', label: '1M' },
        { value: '3M', label: '3M' },
        { value: '6M', label: '6M' },
        { value: '1Y', label: '1Y' },
    ];

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchChartData();
            checkWatchlistStatus();
        }
    }, [id]);

    useEffect(() => {
        if (id && period) {
            fetchChartData();
        }
    }, [period]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await productService.getProduct(id);
            setProduct(response.data.product);
        } catch (error) {
            toast.error('Failed to fetch product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async () => {
        setChartLoading(true);
        try {
            const response = await productService.getProductChart(id, period);
            setChartData(response.data.chartData.map(point => ({
                date: formatDate(point.date),
                price: point.price,
                timestamp: new Date(point.date).getTime(),
            })));
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setChartLoading(false);
        }
    };

    const checkWatchlistStatus = async () => {
        try {
            const response = await watchlistService.checkWatchlist(id);
            setIsInWatchlist(response.data.inWatchlist);
        } catch (error) {
            console.error('Error checking watchlist status:', error);
        }
    };

    const handleWatchlistToggle = async () => {
        try {
            if (isInWatchlist) {
                await watchlistService.removeFromWatchlist(id);
                setIsInWatchlist(false);
                toast.success('Removed from watchlist');
            } else {
                await watchlistService.addToWatchlist(id);
                setIsInWatchlist(true);
                toast.success('Added to watchlist');
            }
        } catch (error) {
            toast.error('Failed to update watchlist');
        }
    };

    const handleBuy = async () => {
        setBuyLoading(true);
        try {
            const totalAmount = buyUnits * product.pricePerUnit;

            if (user.walletBalance < totalAmount) {
                toast.error('Insufficient wallet balance');
                return;
            }

            const response = await transactionService.buyProduct(id, buyUnits);

            // Update wallet balance
            updateWalletBalance(response.data.newWalletBalance);

            toast.success('Purchase completed successfully!');
            setShowBuyModal(false);
            setBuyUnits(1);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Purchase failed');
        } finally {
            setBuyLoading(false);
        }
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'stock':
                return 'bg-blue-100 text-blue-800';
            case 'mutual_fund':
                return 'bg-green-100 text-green-800';
            case 'etf':
                return 'bg-purple-100 text-purple-800';
            case 'bond':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
                    <button
                        onClick={() => navigate('/products')}
                        className="btn btn-primary"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = buyUnits * product.pricePerUnit;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </button>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <span className={`ml-3 badge ${getCategoryBadgeColor(product.category)}`}>
                                {product.category.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-lg text-gray-600 font-mono">{product.symbol}</p>
                        {product.sector && (
                            <p className="text-sm text-gray-500 mt-1">{product.sector}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={handleWatchlistToggle}
                            className={`btn ${isInWatchlist ? 'btn-danger' : 'btn-secondary'
                                } flex items-center`}
                        >
                            <Heart className={`h-4 w-4 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
                            {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>

                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="btn btn-success flex items-center"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Price Section */}
                    <div className="card">
                        <div className="flex items-baseline mb-4">
                            <span className="text-4xl font-bold text-gray-900">
                                {formatCurrency(product.pricePerUnit)}
                            </span>
                            {product.returnPercentage !== undefined && (
                                <span className={`ml-4 text-lg ${getPercentageColor(product.returnPercentage)}`}>
                                    {product.returnPercentage >= 0 ? (
                                        <TrendingUp className="inline h-4 w-4 mr-1" />
                                    ) : (
                                        <TrendingDown className="inline h-4 w-4 mr-1" />
                                    )}
                                    {formatPercentage(product.returnPercentage)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2" />
                                Price Chart
                            </h2>

                            <div className="flex space-x-2">
                                {periods.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setPeriod(value)}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${period === value
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {chartLoading ? (
                            <div className="h-80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            domain={['dataMin - 10', 'dataMax + 10']}
                                        />
                                        <Tooltip
                                            formatter={(value) => [formatCurrency(value), 'Price']}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            dot={false}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="card">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Info className="h-5 w-5 mr-2" />
                                About
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                        <div className="space-y-4">
                            {product.peRatio && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">P/E Ratio</span>
                                    <span className="font-medium">{product.peRatio}</span>
                                </div>
                            )}
                            {product.marketCap && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Market Cap</span>
                                    <span className="font-medium">{formatCurrency(product.marketCap)}</span>
                                </div>
                            )}
                            {product.yearHigh && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">52W High</span>
                                    <span className="font-medium">{formatCurrency(product.yearHigh)}</span>
                                </div>
                            )}
                            {product.yearLow && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">52W Low</span>
                                    <span className="font-medium">{formatCurrency(product.yearLow)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Buy */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Buy</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Units
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={buyUnits}
                                    onChange={(e) => setBuyUnits(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="input"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span>Price per unit:</span>
                                    <span>{formatCurrency(product.pricePerUnit)}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span>Units:</span>
                                    <span>{buyUnits}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600">
                                Wallet Balance: {formatCurrency(user?.walletBalance || 0)}
                            </div>

                            <button
                                onClick={() => setShowBuyModal(true)}
                                disabled={user?.walletBalance < totalAmount}
                                className="btn btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {user?.walletBalance < totalAmount ? 'Insufficient Balance' : 'Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buy Modal */}
            {showBuyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Purchase</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span>Product:</span>
                                <span className="font-medium">{product.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Price per unit:</span>
                                <span>{formatCurrency(product.pricePerUnit)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Units:</span>
                                <span>{buyUnits}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                Remaining Balance: {formatCurrency((user?.walletBalance || 0) - totalAmount)}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowBuyModal(false)}
                                className="btn btn-secondary flex-1"
                                disabled={buyLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBuy}
                                disabled={buyLoading}
                                className="btn btn-success flex-1"
                            >
                                {buyLoading ? 'Processing...' : 'Confirm Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;