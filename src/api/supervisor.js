import api from './axios';

export const supervisorService = {
  // Get supervisor profile
  getMyProfile: () => api.get('/supervisors/me'),
  
  // Get all supervisors
  getAllSupervisors: (page = 1, limit = 10, search = '') => 
    api.get(`/supervisors?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
  
  // Get supervisor by ID
  getSupervisorById: (id) => api.get(`/supervisors/${id}`),
  
  // Create supervisor profile
  createProfile: (data) => api.post('/supervisors/profile', data),
  
  // Update supervisor profile
  updateProfile: (data) => api.put('/supervisors/profile', data),
  
  // Delete supervisor profile
  deleteProfile: () => api.delete('/supervisors/profile'),
  
  // Add student to supervision
  addStudent: (studentId) => api.post(`/supervisors/students/${studentId}`),
  
  // Remove student from supervision
  removeStudent: (studentId) => api.delete(`/supervisors/students/${studentId}`),
};
