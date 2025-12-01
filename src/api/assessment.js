import api from './axios';

export const assessmentService = {
  // Submit or update patient's assessment
  submitAssessment: (data) => api.post('/assessments', data),
  
  // Get current patient's own assessment
  getMyAssessment: () => api.get('/assessments/me'),
  
  // Get recommended therapists based on assessment
  getRecommendedTherapists: () => api.get('/assessments/recommendations'),
  
  // Get assessment by patient ID (for therapists/admin)
  getAssessmentByPatientId: (patientId) => api.get(`/assessments/patient/${patientId}`),
  
  // Get all assessments (admin only)
  getAllAssessments: (page = 1, limit = 10) => api.get(`/assessments/all?page=${page}&limit=${limit}`),
  
  // Delete assessment
  deleteAssessment: (id) => api.delete(`/assessments/${id}`),
};