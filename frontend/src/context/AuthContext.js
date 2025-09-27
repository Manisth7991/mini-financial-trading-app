import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authService } from '../services';
import { storage } from '../utils/helpers';

// Initial state
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    isInitialized: false,
    signupSuccess: false,
};

// Action types
const ActionTypes = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    SIGNUP_START: 'SIGNUP_START',
    SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
    SIGNUP_FAILURE: 'SIGNUP_FAILURE',
    LOGOUT: 'LOGOUT',
    LOAD_USER: 'LOAD_USER',
    CLEAR_ERROR: 'CLEAR_ERROR',
    UPDATE_WALLET: 'UPDATE_WALLET',
};

// Reducer
const authReducer = (state, action) => {
    console.log('AuthReducer: Action type:', action.type, 'Payload:', action.payload);
    switch (action.type) {
        case ActionTypes.LOGIN_START:
        case ActionTypes.SIGNUP_START:
            return {
                ...state,
                loading: true,
                error: null,
                signupSuccess: false,
            };

        case ActionTypes.LOGIN_SUCCESS:
            console.log('AuthReducer: Processing LOGIN_SUCCESS with payload:', action.payload);
            const loginState = {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
                isInitialized: true,
            };
            console.log('AuthReducer: New authenticated state:', {
                isAuthenticated: loginState.isAuthenticated,
                user: loginState.user?.email,
                hasToken: !!loginState.token
            });
            return loginState;

        case ActionTypes.SIGNUP_SUCCESS:
            console.log('AuthReducer: Processing SIGNUP_SUCCESS - account created, redirecting to login');
            return {
                ...state,
                loading: false,
                error: null,
                signupSuccess: true,
                isInitialized: true,
            };

        case ActionTypes.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };

        case ActionTypes.SIGNUP_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
                signupSuccess: false,
            };

        case ActionTypes.LOGOUT:
            // Only update if not already logged out to prevent unnecessary re-renders
            if (state.isAuthenticated || state.loading) {
                return {
                    ...state,
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    loading: false,
                    error: null,
                    isInitialized: true,
                };
            }
            return state;

        case ActionTypes.LOAD_USER:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
                isInitialized: true,
            };

        case ActionTypes.CLEAR_ERROR:
            // Only update if there's actually an error to clear
            if (state.error) {
                return {
                    ...state,
                    error: null,
                };
            }
            return state;

        case ActionTypes.UPDATE_WALLET:
            return {
                ...state,
                user: {
                    ...state.user,
                    walletBalance: action.payload,
                },
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const isInitialized = useRef(false);

    // Load user from localStorage on mount
    useEffect(() => {
        // Prevent multiple initializations
        if (isInitialized.current) {
            console.log('AuthContext: Already initialized, skipping');
            return;
        }

        console.log('AuthContext: Initial load - checking localStorage');
        isInitialized.current = true;

        const token = storage.get('token');
        const user = storage.get('user');

        console.log('AuthContext: Token exists:', !!token);
        console.log('AuthContext: User exists:', !!user);

        if (token && user) {
            console.log('AuthContext: Loading existing user session');
            dispatch({
                type: ActionTypes.LOAD_USER,
                payload: { user, token },
            });
        } else {
            console.log('AuthContext: No existing session, setting to logged out');
            dispatch({ type: ActionTypes.LOGOUT });
        }
    }, []); // Empty dependency array to run only once

    // Login function
    const login = async (credentials) => {
        console.log('AuthContext: Starting login process with credentials:', {
            email: credentials.email,
            passwordLength: credentials.password?.length
        });
        dispatch({ type: ActionTypes.LOGIN_START });

        try {
            const response = await authService.login(credentials);
            console.log('AuthContext: Login API response:', {
                success: response.data?.success,
                hasToken: !!response.data?.data?.token,
                hasUser: !!response.data?.data?.user
            });

            // Validate response structure
            if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
                throw new Error('Invalid response format from server');
            }

            const { token, user } = response.data.data;

            // Store in localStorage
            storage.set('token', token);
            storage.set('user', user);
            console.log('AuthContext: Successfully stored token and user in localStorage');

            // Dispatch success action
            dispatch({
                type: ActionTypes.LOGIN_SUCCESS,
                payload: { token, user },
            });
            console.log('AuthContext: Successfully dispatched LOGIN_SUCCESS');

            return response;
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            dispatch({
                type: ActionTypes.LOGIN_FAILURE,
                payload: errorMessage,
            });
            throw error;
        }
    };

    // Signup function
    const signup = async (formData) => {
        console.log('AuthContext: Starting signup process');
        dispatch({ type: ActionTypes.SIGNUP_START });

        try {
            const response = await authService.signup(formData);
            console.log('AuthContext: Signup API response:', {
                success: response.data?.success,
                hasToken: !!response.data?.data?.token,
                hasUser: !!response.data?.data?.user
            });

            // Validate response structure
            if (!response.data?.success || !response.data?.data?.token || !response.data?.data?.user) {
                throw new Error('Invalid response format from server');
            }

            const { token, user } = response.data.data;

            // Don't store in localStorage - user needs to login after signup
            console.log('AuthContext: Account created successfully, user needs to login');

            dispatch({
                type: ActionTypes.SIGNUP_SUCCESS,
                payload: { message: 'Account created successfully' },
            });
            console.log('AuthContext: Successfully dispatched SIGNUP_SUCCESS - redirecting to login');

            return response;
        } catch (error) {
            console.error('AuthContext: Signup error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
            dispatch({
                type: ActionTypes.SIGNUP_FAILURE,
                payload: errorMessage,
            });
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        console.log('AuthContext: Logging out user');

        // Clear localStorage using storage utility
        storage.remove('token');
        storage.remove('user');

        dispatch({ type: ActionTypes.LOGOUT });
    };

    // Clear error function
    const clearError = () => {
        // Only dispatch if there's actually an error to clear
        if (state.error) {
            dispatch({ type: ActionTypes.CLEAR_ERROR });
        }
    };

    // Update wallet balance
    const updateWalletBalance = (newBalance) => {
        dispatch({
            type: ActionTypes.UPDATE_WALLET,
            payload: newBalance,
        });

        // Update localStorage
        const updatedUser = { ...state.user, walletBalance: newBalance };
        storage.set('user', updatedUser);
    };

    // Refresh user data
    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            const updatedUser = response.data.user;

            storage.set('user', updatedUser);
            dispatch({
                type: ActionTypes.LOAD_USER,
                payload: { user: updatedUser, token: state.token },
            });
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const value = {
        ...state,
        login,
        signup,
        logout,
        clearError,
        updateWalletBalance,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};