import api from './axios';

export const chatService = {
  // Get all chat rooms for current user
  getChatRooms: () => api.get('/chat/rooms'),

  // Get or create chat room with another user
  getOrCreateChatRoom: (otherUserId) => api.get(`/chat/room/${otherUserId}`),

  // Get messages for a room
  getMessages: (roomId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/chat/room/${roomId}/messages${queryString ? `?${queryString}` : ''}`);
  },

  // Send message (REST fallback)
  sendMessage: (roomId, content, messageType = 'text') => 
    api.post(`/chat/room/${roomId}/messages`, { content, messageType }),

  // Mark messages as read
  markMessagesAsRead: (roomId) => api.put(`/chat/room/${roomId}/read`),

  // Get unread message count
  getUnreadCount: () => api.get('/chat/unread-count'),

  // Validate chat access
  validateChatAccess: (roomId) => api.post('/chat/validate-access', { roomId }),
};
