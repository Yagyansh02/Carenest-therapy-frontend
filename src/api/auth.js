import apiClient from './axios';

export const register = (userData) => {
  return apiClient.post('/users/register', userData);
};

export const login = (credentials) => {
  return apiClient.post('/users/login', credentials);
};

export const logout = () => {
  return apiClient.post('/users/logout');
};

export const getCurrentUser = () => {
  return apiClient.get('/users/me');
};

export const refreshAccessToken = () => {
  return apiClient.post('/users/refresh-token');
};

export const changePassword = (passwordData) => {
  return apiClient.post('/users/change-password', passwordData);
};