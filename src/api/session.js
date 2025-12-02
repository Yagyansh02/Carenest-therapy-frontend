import api from './axios';

export const sessionService = {
  // Create a new session booking
  createSession: (data) => api.post('/sessions', data),
  
  // Get all sessions for current user (filtered by role)
  getAllSessions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/sessions${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get specific session by ID
  getSessionById: (id) => api.get(`/sessions/${id}`),
  
  // Get patient's own sessions
  getMyPatientSessions: () => api.get('/sessions/patient/my-sessions'),
  
  // Get therapist's own sessions
  getMyTherapistSessions: (params) => api.get('/sessions/therapist/my-sessions', { params }),
  
  // Get pending sessions (therapist only)
  getPendingSessions: () => api.get('/sessions/therapist/pending'),
  
  // Get patient statistics
  getPatientStatistics: () => api.get('/sessions/patient/statistics'),
  
  // Get therapist statistics
  getTherapistStatistics: () => api.get('/sessions/therapist/statistics'),
  
  // Update session
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  
  // Accept session request (therapist only)
  acceptSession: (id, meetingLink, therapistNotes = '') => 
    api.post(`/sessions/${id}/accept`, { meetingLink, therapistNotes }),
  
  // Reject session request (therapist only)
  rejectSession: (id, reason = '') => 
    api.post(`/sessions/${id}/reject`, { reason }),
  
  // Cancel session
  cancelSession: (id, reason) => api.post(`/sessions/${id}/cancel`, { cancellationReason: reason }),
  
  // Complete session (therapist only)
  completeSession: (id) => api.post(`/sessions/${id}/complete`),
  
  // Mark as no-show (therapist only)
  markNoShow: (id) => api.post(`/sessions/${id}/no-show`),
  
  // Add therapist notes (therapist only)
  addTherapistNotes: (id, notes) => api.put(`/sessions/${id}/notes`, { therapistNotes: notes }),
  
  // Update payment status
  updatePaymentStatus: (id, status) => api.put(`/sessions/${id}/payment`, { paymentStatus: status }),
  
  // Delete session (admin only)
  deleteSession: (id) => api.delete(`/sessions/${id}`),
};
