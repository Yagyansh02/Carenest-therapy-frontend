import api from './axios';

export const feedbackService = {
  // Create feedback
  createFeedback: (data) => api.post('/feedbacks', data),

  // Get all feedbacks with filters
  getAllFeedbacks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/feedbacks${queryString ? `?${queryString}` : ''}`);
  },

  // Get feedback by ID
  getFeedbackById: (id) => api.get(`/feedbacks/${id}`),

  // Update feedback
  updateFeedback: (id, data) => api.put(`/feedbacks/${id}`, data),

  // Delete feedback
  deleteFeedback: (id) => api.delete(`/feedbacks/${id}`),

  // Add response to feedback
  addResponse: (id, responseText) => 
    api.post(`/feedbacks/${id}/response`, { responseText }),

  // Flag feedback (admin only)
  flagFeedback: (id, reason) => 
    api.post(`/feedbacks/${id}/flag`, { reason }),

  // Get feedback stats for a user
  getFeedbackStats: (userId) => api.get(`/feedbacks/stats/${userId}`),

  // Get therapist rating (public)
  getTherapistRating: (therapistId) => 
    api.get(`/feedbacks/therapist/${therapistId}/rating`),

  // Convenience methods for specific feedback types
  getMyReceivedFeedback: (page = 1, limit = 10) =>
    api.get(`/feedbacks?received=true&page=${page}&limit=${limit}`),

  getMyGivenFeedback: (page = 1, limit = 10) =>
    api.get(`/feedbacks?given=true&page=${page}&limit=${limit}`),

  getSessionFeedback: (sessionId) =>
    api.get(`/feedbacks?sessionId=${sessionId}`),
};
