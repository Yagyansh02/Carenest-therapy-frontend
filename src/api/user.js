import api from './axios';

export const userService = {
  updateAccountDetails: (data) => api.patch('/users/update-account', data),
  updateAvatar: (data) => api.patch('/users/avatar', data),
  getWatchHistory: () => api.get('/users/history'),
};