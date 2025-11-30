import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUserData,
  clearError,
} from '../store/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Check if user is logged in on mount
    if (isAuthenticated && !user) {
      dispatch(getCurrentUserData());
    }
  }, [dispatch, isAuthenticated, user]);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      return result.payload;
    }
    throw new Error(result.payload || 'Login failed');
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      return result.payload;
    }
    // Create error object with proper message
    const error = new Error(result.payload || 'Registration failed');
    error.response = { data: { message: result.payload } };
    throw error;
  };

  const logout = async () => {
    await dispatch(logoutUser());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading: isLoading,
        error,
        login,
        register,
        logout,
        clearError: clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};