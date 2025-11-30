import api from './axios';

export const therapistService = {
  getAllTherapists: (params) => api.get('/therapists', { params }),
  getTherapistById: (id) => api.get(`/therapists/${id}`),
  getTherapistAvailability: (id) => api.get(`/therapists/${id}/availability`),
  createTherapistProfile: (profileData) => api.post('/therapists/profile', profileData),
  getMyProfile: () => api.get('/therapists/me'),
  updateTherapistProfile: (profileData) => api.put('/therapists/profile', profileData),
  updateAvailability: (availability) => api.put('/therapists/availability', { availability }),
  updateQualifications: (qualifications) => api.put('/therapists/qualifications', { qualifications }),
  updateSpecializations: (specializations) => api.put('/therapists/specializations', { specializations }),
};