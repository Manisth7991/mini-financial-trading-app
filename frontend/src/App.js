import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';

// Layouts
const AuthLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
        {children}
    </div>
);

const AppLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route
                            path="/login"
                            element={
                                <AuthLayout>
                                    <Login />
                                </AuthLayout>
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <AuthLayout>
                                    <Signup />
                                </AuthLayout>
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <Dashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <ProductList />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/products/:id"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <ProductDetail />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Default redirects */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>

                    {/* Toast notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                theme: {
                                    primary: '#4aed88',
                                },
                            },
                            error: {
                                duration: 4000,
                                theme: {
                                    primary: '#f56565',
                                },
                            },
                        }}
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;