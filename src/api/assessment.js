import api from './axios';

export const assessmentService = {
  getAllAssessments: () => api.get('/assessments'),
  getAssessmentById: (id) => api.get(`/assessments/${id}`),
  submitAssessment: (id, data) => api.post(`/assessments/${id}/submit`, data),
};