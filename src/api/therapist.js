import api from './axios';

export const therapistService = {
  getAllTherapists: (params) => api.get('/therapists', { params }),
  getTherapistById: (id) => api.get(`/therapists/${id}`),
  getTherapistAvailability: (id) => api.get(`/therapists/${id}/availability`),
};