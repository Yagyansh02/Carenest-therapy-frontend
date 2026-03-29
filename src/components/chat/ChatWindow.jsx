import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { chatService } from '../../api/chat';
import { useSocket } from '../../context/SocketContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { logger } from '../../utils/logger';

export const ChatWindow = ({ room, user, onRoomUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const { 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    sendMessage: socketSendMessage, 
    startTyping,
    stopTyping,
    markAsRead,
    on, 
    off 
  } = useSocket();

  // Get the other participant's info
  const getOtherParticipant = () => {
    if (!room) return null;
    if (user.role === 'patient') {
      return room.therapistId;
    }
    return room.patientId;
  };

  const otherParticipant = getOtherParticipant();

  // Fetch messages
  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!room?._id) return;
    
    try {
      setLoading(true);
      const response = await chatService.getMessages(room._id, { 
        page: pageNum, 
        limit: 50 
      });
      
      const data = response.data.data;
      const newMessages = data.messages || [];
      
      if (append) {
        setMessages((prev) => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }
      
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      logger.error('Failed to fetch messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [room?._id]);

  // Initial load and room change
  useEffect(() => {
    if (room?._id) {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      setError(null);
      fetchMessages(1);
    }
  }, [room?._id, fetchMessages]);

  // Join/leave room
  useEffect(() => {
    if (room?._id && isConnected) {
      joinRoom(room._id);
      markAsRead(room._id);
      
      return () => {
        leaveRoom(room._id);
      };
    }
  }, [room?._id, isConnected, joinRoom, leaveRoom, markAsRead]);

  // Socket event listeners
  useEffect(() => {
    if (!room?._id) return;

    const handleNewMessage = (data) => {
      if (data.roomId === room._id) {
        setMessages((prev) => [...prev, data.message]);
        // Mark as read if window is focused
        if (document.hasFocus()) {
          markAsRead(room._id);
        }
        // Update room preview
        onRoomUpdate({
          _id: room._id,
          lastMessageAt: data.message.createdAt,
          lastMessagePreview: data.message.content.substring(0, 100),
        });
      }
    };

    const handleTyping = (data) => {
      if (data.userId !== user._id) {
        if (data.isTyping) {
          setTypingUser(data.fullName);
          // Clear previous timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          // Auto-clear typing after 3 seconds
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        } else {
          setTypingUser(null);
        }
      }
    };

    const handleMessagesRead = () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId._id === user._id ? { ...msg, isRead: true } : msg
        )
      );
    };

    const handleJoinedRoom = (data) => {
      if (data.success) {
        logger.info('Successfully joined room:', data.roomId);
      }
    };

    const handleError = (data) => {
      logger.error('Socket error:', data.message);
      setError(data.message);
    };

    on('new_message', handleNewMessage);
    on('user_typing', handleTyping);
    on('messages_read', handleMessagesRead);
    on('joined_room', handleJoinedRoom);
    on('error', handleError);

    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleTyping);
      off('messages_read', handleMessagesRead);
      off('joined_room', handleJoinedRoom);
      off('error', handleError);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [room?._id, user._id, on, off, markAsRead, onRoomUpdate]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (content) => {
    if (!content.trim() || !room?._id) return;

    // Use WebSocket if connected, otherwise fall back to REST
    if (isConnected) {
      socketSendMessage(room._id, content);
    } else {
      try {
        const response = await chatService.sendMessage(room._id, content);
        setMessages((prev) => [...prev, response.data.data]);
      } catch (err) {
        logger.error('Failed to send message:', err);
        setError('Failed to send message. Please try again.');
      }
    }
  };

  // Typing handlers
  const handleTypingStart = () => {
    if (room?._id && isConnected) {
      startTyping(room._id);
    }
  };

  const handleTypingStop = () => {
    if (room?._id && isConnected) {
      stopTyping(room._id);
    }
  };

  // Load more messages
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchMessages(page + 1, true);
    }
  };

  // No room selected
  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#9ECAD6]/10 text-gray-500">
        <MessageCircle className="w-16 h-16 mb-4 text-[#748DAE]/50" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Select a conversation</h3>
        <p className="text-sm text-gray-500">Choose a conversation from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#748DAE] flex items-center justify-center text-white font-semibold">
          {otherParticipant?.fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 truncate">
            {otherParticipant?.fullName || 'Unknown User'}
          </h2>
          <p className="text-xs text-gray-500 capitalize">
            {otherParticipant?.role || ''}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#748DAE] hover:bg-[#9ECAD6]/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Load older messages'
              )}
            </button>
          </div>
        )}

        {/* Messages List */}
        <MessageList messages={messages} currentUserId={user._id} />

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={!isConnected}
      />
    </div>
  );
};
