import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { productService, watchlistService } from '../services';
import { formatCurrency, formatPercentage, getPercentageColor } from '../utils/helpers';

const ProductCard = ({ product, onWatchlistToggle }) => {
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkWatchlistStatus();
    }, [product._id]);

    const checkWatchlistStatus = async () => {
        try {
            const response = await watchlistService.checkWatchlist(product._id);
            setIsInWatchlist(response.data.inWatchlist);
        } catch (error) {
            console.error('Error checking watchlist status:', error);
        }
    };

    const handleWatchlistToggle = async () => {
        setLoading(true);
        try {
            if (isInWatchlist) {
                await watchlistService.removeFromWatchlist(product._id);
                setIsInWatchlist(false);
                toast.success('Removed from watchlist');
            } else {
                await watchlistService.addToWatchlist(product._id);
                setIsInWatchlist(true);
                toast.success('Added to watchlist');
            }
            onWatchlistToggle?.();
        } catch (error) {
            toast.error('Failed to update watchlist');
        } finally {
            setLoading(false);
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

    return (
        <div className="card-hover">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <span className={`ml-2 badge ${getCategoryBadgeColor(product.category)}`}>
                            {product.category.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{product.symbol}</p>
                    {product.sector && (
                        <p className="text-xs text-gray-500 mt-1">{product.sector}</p>
                    )}
                </div>

                <button
                    onClick={handleWatchlistToggle}
                    disabled={loading}
                    className={`p-2 rounded-full transition-colors duration-200 ${isInWatchlist
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                >
                    <Heart className={`h-5 w-5 ${isInWatchlist ? 'fill-current' : ''}`} />
                </button>
            </div>

            <div className="mb-4">
                <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(product.pricePerUnit)}
                    </span>
                    {product.returnPercentage !== undefined && (
                        <span className={`ml-2 text-sm ${getPercentageColor(product.returnPercentage)}`}>
                            {product.returnPercentage >= 0 ? (
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="inline h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(product.returnPercentage)}
                        </span>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {product.peRatio && (
                    <div>
                        <p className="text-xs text-gray-500">P/E Ratio</p>
                        <p className="text-sm font-medium">{product.peRatio}</p>
                    </div>
                )}
                {product.marketCap && (
                    <div>
                        <p className="text-xs text-gray-500">Market Cap</p>
                        <p className="text-sm font-medium">{formatCurrency(product.marketCap)}</p>
                    </div>
                )}
                {product.yearHigh && (
                    <div>
                        <p className="text-xs text-gray-500">52W High</p>
                        <p className="text-sm font-medium">{formatCurrency(product.yearHigh)}</p>
                    </div>
                )}
                {product.yearLow && (
                    <div>
                        <p className="text-xs text-gray-500">52W Low</p>
                        <p className="text-sm font-medium">{formatCurrency(product.yearLow)}</p>
                    </div>
                )}
            </div>

            <Link
                to={`/products/${product._id}`}
                className="btn btn-primary w-full"
            >
                View Details
            </Link>
        </div>
    );
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        sort: 'name',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters, pagination.page]);

    const fetchCategories = async () => {
        try {
            const response = await productService.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getProducts({
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
            });

            setProducts(response.data.products);
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination,
            }));
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
        setPagination(prev => ({
            ...prev,
            page: 1,
        }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage,
        }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Products</h1>
                <p className="text-gray-600">Discover and invest in stocks, mutual funds, ETFs, and bonds</p>
            </div>

            {/* Filters */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="input pl-10"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            className="input pl-10 appearance-none"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort */}
                    <select
                        className="input"
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="latest">Latest</option>
                    </select>
                </div>
            </div>

            {/* Results */}
            <div className="mb-6">
                <p className="text-sm text-gray-600">
                    Showing {products.length} of {pagination.total} products
                </p>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="h-3 bg-gray-300 rounded"></div>
                                <div className="h-3 bg-gray-300 rounded"></div>
                            </div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onWatchlistToggle={fetchProducts}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {[...Array(pagination.pages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`btn ${pagination.page === page ? 'btn-primary' : 'btn-secondary'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">No products found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;