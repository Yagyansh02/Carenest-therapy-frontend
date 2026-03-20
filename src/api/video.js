import api from './axios';

export const videoService = {
  // Fetch peer IDs + session info for the built-in video call
  getVideoCallToken: (sessionId) => api.get(`/video/${sessionId}/token`),
};
