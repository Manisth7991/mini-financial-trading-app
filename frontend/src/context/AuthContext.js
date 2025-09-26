import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';
import { storage } from '../utils/helpers';

// Initial state
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
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
    switch (action.type) {
        case ActionTypes.LOGIN_START:
        case ActionTypes.SIGNUP_START:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case ActionTypes.LOGIN_SUCCESS:
        case ActionTypes.SIGNUP_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };

        case ActionTypes.LOGIN_FAILURE:
        case ActionTypes.SIGNUP_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };

        case ActionTypes.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };

        case ActionTypes.LOAD_USER:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };

        case ActionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

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

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            const token = storage.get('token');
            const user = storage.get('user');

            if (token && user) {
                dispatch({
                    type: ActionTypes.LOAD_USER,
                    payload: { user, token },
                });
            } else {
                dispatch({ type: ActionTypes.LOGOUT });
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async (credentials) => {
        dispatch({ type: ActionTypes.LOGIN_START });

        try {
            const response = await authService.login(credentials);

            // Store in localStorage
            storage.set('token', response.data.token);
            storage.set('user', response.data.user);

            dispatch({
                type: ActionTypes.LOGIN_SUCCESS,
                payload: response.data,
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({
                type: ActionTypes.LOGIN_FAILURE,
                payload: errorMessage,
            });
            throw error;
        }
    };

    // Signup function
    const signup = async (formData) => {
        dispatch({ type: ActionTypes.SIGNUP_START });

        try {
            const response = await authService.signup(formData);

            // Store in localStorage
            storage.set('token', response.data.token);
            storage.set('user', response.data.user);

            dispatch({
                type: ActionTypes.SIGNUP_SUCCESS,
                payload: response.data,
            });

            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            dispatch({
                type: ActionTypes.SIGNUP_FAILURE,
                payload: errorMessage,
            });
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        dispatch({ type: ActionTypes.LOGOUT });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: ActionTypes.CLEAR_ERROR });
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