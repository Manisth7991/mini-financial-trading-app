import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClearTokens = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleClearTokens = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Call logout from context
        logout();

        alert('All tokens cleared! Redirecting to login...');
        navigate('/login');
    };

    const showCurrentTokens = () => {
        console.log('Current localStorage:', localStorage);
        console.log('Token:', localStorage.getItem('token'));
        console.log('User:', localStorage.getItem('user'));

        const tokenDisplay = localStorage.getItem('token') ?
            localStorage.getItem('token').substring(0, 50) + '...' : 'No token';

        alert(`Current token: ${tokenDisplay}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Clear Authentication Tokens
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Use this page to clear stored authentication tokens
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={showCurrentTokens}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Show Current Tokens (Console)
                    </button>

                    <button
                        onClick={handleClearTokens}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                        Clear All Tokens
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClearTokens;