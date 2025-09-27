import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, CreditCard, Upload, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePAN, validateEmail } from '../utils/helpers';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, loading, clearError, isAuthenticated, signupSuccess } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        panNumber: '',
    });
    const [idImage, setIdImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated && !loading) {
            console.log('Signup.js: User already authenticated, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // Redirect to login if signup is successful
    useEffect(() => {
        if (signupSuccess && !loading) {
            console.log('Signup.js: Account created successfully, redirecting to login with user email');
            navigate('/login', {
                replace: true,
                state: {
                    email: formData.email,
                    fromSignup: true
                }
            });
        }
    }, [signupSuccess, loading, navigate, formData.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Only convert PAN number to uppercase, keep other fields as entered
        const processedValue = name === 'panNumber' ? value.toUpperCase() : value;

        setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
        clearError();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            setIdImage(file);
            if (errors.idImage) {
                setErrors(prev => ({
                    ...prev,
                    idImage: '',
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // PAN validation
        if (!formData.panNumber) {
            newErrors.panNumber = 'PAN number is required';
        } else if (!validatePAN(formData.panNumber)) {
            newErrors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
        }

        // ID image validation
        if (!idImage) {
            newErrors.idImage = 'ID image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('panNumber', formData.panNumber);
        submitData.append('idImage', idImage);

        try {
            await signup(submitData);
            toast.success('Account created successfully!');
            // Clear form on successful signup
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                panNumber: '',
            });
            setIdImage(null);
            // Navigation will be handled by useEffect watching signupSuccess
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Complete KYC to start trading
                    </p>
                    <p className="mt-1 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name *
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address *
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password *
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        {/* PAN Number */}
                        <div>
                            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
                                PAN Number *
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="panNumber"
                                    name="panNumber"
                                    type="text"
                                    required
                                    className={`input pl-10 ${errors.panNumber ? 'border-red-500' : ''}`}
                                    placeholder="ABCDE1234F"
                                    value={formData.panNumber}
                                    onChange={handleChange}
                                    maxLength={10}
                                />
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
                        </div>

                        {/* ID Image Upload */}
                        <div>
                            <label htmlFor="idImage" className="block text-sm font-medium text-gray-700">
                                Upload ID Image *
                            </label>
                            <div className="mt-1">
                                <label
                                    htmlFor="idImage"
                                    className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${errors.idImage ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <div className="text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            {idImage ? idImage.name : 'Click to upload ID image'}
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                    <input
                                        id="idImage"
                                        name="idImage"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            {errors.idImage && <p className="mt-1 text-sm text-red-600">{errors.idImage}</p>}
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
                                    Creating account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;