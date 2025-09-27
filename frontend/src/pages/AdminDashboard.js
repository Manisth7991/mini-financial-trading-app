import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Activity,
    DollarSign,
    Package,
    Eye,
    Shield
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboard();
            setDashboardData(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
                        <p className="text-red-600 mt-2">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { overview, recentUsers, recentTransactions } = dashboardData;

    const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
        const colorClasses = {
            primary: 'bg-primary-50 text-primary-600',
            success: 'bg-success-50 text-success-600',
            warning: 'bg-yellow-50 text-yellow-600',
            info: 'bg-blue-50 text-blue-600',
        };

        return (
            <div className="card">
                <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-primary-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                            Overview of platform activity and user management
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={overview.totalUsers.toLocaleString()}
                        icon={Users}
                        color="primary"
                    />
                    <StatCard
                        title="Total Transactions"
                        value={overview.totalTransactions.toLocaleString()}
                        icon={Activity}
                        color="success"
                    />
                    <StatCard
                        title="Total Volume"
                        value={formatCurrency(overview.totalVolume)}
                        icon={DollarSign}
                        color="warning"
                    />
                    <StatCard
                        title="Active Products"
                        value={overview.totalProducts.toLocaleString()}
                        icon={Package}
                        color="info"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center"
                            >
                                View All <Eye className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(user.walletBalance)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDateTime(user.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <button
                                onClick={() => navigate('/admin/transactions')}
                                className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center"
                            >
                                View All <Eye className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {transaction.user.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {transaction.type.toUpperCase()} {transaction.units} units of {transaction.product.symbol}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(transaction.totalAmount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDateTime(transaction.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="card-interactive text-left p-6"
                        >
                            <Users className="h-8 w-8 text-primary-600 mb-3" />
                            <h4 className="font-semibold text-gray-900">Manage Users</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                View and manage user accounts and permissions
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/admin/transactions')}
                            className="card-interactive text-left p-6"
                        >
                            <Activity className="h-8 w-8 text-success-600 mb-3" />
                            <h4 className="font-semibold text-gray-900">View Transactions</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Monitor all platform transactions and activity
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            className="card-interactive text-left p-6"
                        >
                            <Package className="h-8 w-8 text-blue-600 mb-3" />
                            <h4 className="font-semibold text-gray-900">Manage Products</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                View and manage investment products
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;