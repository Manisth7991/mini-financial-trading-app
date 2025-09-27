import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PieChart,
    Activity,
    Eye,
    ShoppingCart,
    Heart,
    Briefcase
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { portfolioService, transactionService, watchlistService } from '../services';
import {
    formatCurrency,
    formatPercentage,
    getPercentageColor,
    formatDateTime
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, change, icon: Icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-success-50 text-success-600',
        danger: 'bg-danger-50 text-danger-600',
    };

    return (
        <div className="card">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <p className={`text-sm ${getPercentageColor(change)}`}>
                            {change >= 0 ? (
                                <TrendingUp className="inline h-3 w-3 mr-1" />
                            ) : (
                                <TrendingDown className="inline h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(change)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PortfolioChart = ({ data }) => {
    const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed'];

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [portfolioRes, statsRes, transactionsRes, watchlistRes] = await Promise.all([
                portfolioService.getPortfolio(),
                portfolioService.getStats(),
                transactionService.getTransactions({ limit: 5 }),
                watchlistService.getWatchlist()
            ]);

            setPortfolio(portfolioRes.data);
            setStats(statsRes.data);
            setRecentTransactions(transactionsRes.data.transactions);
            setWatchlist(watchlistRes.data.watchlist.slice(0, 5)); // Show only 5 items
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600">Here's an overview of your investment portfolio</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Wallet Balance"
                    value={formatCurrency(user?.walletBalance || 0)}
                    icon={Wallet}
                    color="primary"
                />
                <StatCard
                    title="Total Invested"
                    value={formatCurrency(portfolio?.summary?.totalInvested || 0)}
                    icon={TrendingUp}
                    color="success"
                />
                <StatCard
                    title="Current Value"
                    value={formatCurrency(portfolio?.summary?.totalCurrentValue || 0)}
                    icon={Activity}
                    color="primary"
                />
                <StatCard
                    title="Total Returns"
                    value={formatCurrency(portfolio?.summary?.totalReturns || 0)}
                    change={portfolio?.summary?.returnPercentage || 0}
                    icon={portfolio?.summary?.totalReturns >= 0 ? TrendingUp : TrendingDown}
                    color={portfolio?.summary?.totalReturns >= 0 ? 'success' : 'danger'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Portfolio Allocation */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Portfolio Allocation
                    </h2>

                    {stats?.categoryBreakdown?.length > 0 ? (
                        <PortfolioChart data={stats.categoryBreakdown} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No investments yet</p>
                                <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
                                    Start investing
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Holdings */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Holdings</h2>

                    {portfolio?.holdings?.length > 0 ? (
                        <div className="space-y-4">
                            {portfolio.holdings.slice(0, 5).map((holding) => (
                                <div key={holding._id} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {holding.product?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {holding.totalUnits} units • {formatCurrency(holding.averagePrice)} avg
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(holding.currentValue)}
                                        </p>
                                        <p className={`text-sm ${getPercentageColor(holding.returnPercentage)}`}>
                                            {formatPercentage(holding.returnPercentage)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {portfolio.holdings.length > 5 && (
                                <Link
                                    to="/portfolio"
                                    className="block text-center text-primary-600 hover:text-primary-700 text-sm mt-4"
                                >
                                    View all holdings
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No holdings yet</p>
                            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
                                Start investing
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Recent Transactions
                        </h2>
                        <Link
                            to="/portfolio"
                            className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                            View all
                        </Link>
                    </div>

                    {recentTransactions.length > 0 ? (
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                                            <ShoppingCart className="h-5 w-5 text-success-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {transaction.product?.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {transaction.units} units • {formatDateTime(transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(transaction.totalAmount)}
                                        </p>
                                        <span className="badge badge-success">
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No transactions yet</p>
                        </div>
                    )}
                </div>

                {/* Watchlist */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <Heart className="h-5 w-5 mr-2" />
                            Watchlist
                        </h2>
                        <Link
                            to="/watchlist"
                            className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                            View all
                        </Link>
                    </div>

                    {watchlist.length > 0 ? (
                        <div className="space-y-4">
                            {watchlist.map((item) => (
                                <div key={item._id} className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {item.product?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {item.product?.symbol} • {item.product?.category}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            {formatCurrency(item.product?.pricePerUnit)}
                                        </p>
                                        <Link
                                            to={`/products/${item.product?._id}`}
                                            className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No items in watchlist</p>
                            <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm">
                                Browse products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;