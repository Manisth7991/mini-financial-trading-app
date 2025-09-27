import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading, clearError, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Get redirect path from location state
    const from = location.state?.from?.pathname || '/dashboard';

    // Redirect to dashboard if already authenticated (for users who refresh the page while logged in)
    useEffect(() => {
        console.log('Login.js: Initial auth check - isAuthenticated:', isAuthenticated, 'loading:', loading);

        // Only redirect if user is already authenticated when component mounts (not during login process)
        if (isAuthenticated && !loading && !isLoggingIn) {
            console.log('Login.js: User already authenticated, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, loading, navigate, from, isLoggingIn]);

    // Focus password field if email is pre-filled from signup
    useEffect(() => {
        if (location.state?.fromSignup && location.state?.email) {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);

        try {
            const response = await login(formData);
            console.log('Login.js: Login successful, response:', response);

            // Clear form on successful login
            setFormData({
                email: '',
                password: '',
            });

            toast.success('Login successful!');

            // Navigate immediately after successful login
            console.log('Login.js: Navigating to dashboard immediately');
            navigate(from, { replace: true });

        } catch (error) {
            console.error('Login.js: Login failed:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    {location.state?.fromSignup ? (
                        <p className="mt-2 text-center text-sm text-green-600 bg-green-50 py-2 px-3 rounded-lg">
                            Account created successfully! Please sign in with your credentials.
                        </p>
                    ) : (
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link
                                to="/signup"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                create a new account
                            </Link>
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input pl-10"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className="input pl-10 pr-10"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    {!location.state?.fromSignup && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Demo credentials:
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Email: demo@example.com | Password: demo123
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;