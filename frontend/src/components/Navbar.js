import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    TrendingUp,
    Briefcase,
    Heart,
    LogOut,
    User,
    Wallet,
    Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/products', label: 'Products', icon: TrendingUp },
        { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
        { path: '/watchlist', label: 'Watchlist', icon: Heart },
        ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: Shield }] : []),
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main nav */}
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <span className="ml-2 text-xl font-bold text-gray-900">TradePro</span>
                            </div>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${location.pathname === path
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Wallet Balance */}
                        <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2">
                            <Wallet className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(user?.walletBalance || 0)}
                            </span>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-primary-600" />
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200">
                <div className="flex justify-around py-2">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center py-2 px-3 text-xs transition-colors duration-200 ${location.pathname === path
                                ? 'text-primary-600'
                                : 'text-gray-500'
                                }`}
                        >
                            <Icon className="h-5 w-5 mb-1" />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;