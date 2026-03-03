import api from './axios';

export const collegeService = {
  // Get college profile
  getMyProfile: () => api.get('/colleges/me'),

  // Get all colleges
  getAllColleges: (page = 1, limit = 10, search = '') =>
    api.get(`/colleges?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),

  // Get college by ID
  getCollegeById: (id) => api.get(`/colleges/${id}`),

  // Create college profile
  createProfile: (data) => api.post('/colleges/profile', data),

  // Update college profile
  updateProfile: (data) => api.put('/colleges/profile', data),

  // Delete college profile
  deleteProfile: () => api.delete('/colleges/profile'),

  // Add student to college
  addStudent: (studentId) => api.post(`/colleges/students/${studentId}`),

  // Remove student from college
  removeStudent: (studentId) => api.delete(`/colleges/students/${studentId}`),
};
