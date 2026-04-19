import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const { accessToken, isAuthenticated, user } = useSelector((state) => state.auth);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        if (isConnected) {
          setSocket(null);
          setIsConnected(false);
        }
      }
      return;
    }

    // Only patients and therapists can use chat
    if (!['patient', 'therapist'].includes(user.role)) {
      return;
    }

    // Create socket connection - extract base URL without /api/v1
    const socketUrl = env.apiBaseUrl.replace('/api/v1', '');
    logger.info('[Socket] Connecting to:', socketUrl);
    
    const newSocket = io(socketUrl, {
      auth: { token: accessToken },
      withCredentials: true,
      // Try polling first, then upgrade to websocket - more reliable
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      path: '/socket.io/',
    });

    // Connection handlers
    newSocket.on('connect', () => {
      logger.info('[Socket] Connected to chat server');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      logger.info('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      logger.error('[Socket] Connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
      reconnectAttempts.current += 1;
    });

    newSocket.on('error', (error) => {
      logger.error('[Socket] Error:', error);
      setConnectionError(error.message || 'Socket error occurred');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      logger.info('[Socket] Cleaning up socket connection');
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, accessToken, user]);

  // Join a chat room
  const joinRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', { roomId });
      logger.info('[Socket] Joining room:', roomId);
    }
  }, [socket, isConnected]);

  // Leave a chat room
  const leaveRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomId });
      logger.info('[Socket] Leaving room:', roomId);
    }
  }, [socket, isConnected]);

  // Send a message
  const sendMessage = useCallback((roomId, content, messageType = 'text') => {
    if (socket && isConnected) {
      socket.emit('send_message', { roomId, content, messageType });
      logger.info('[Socket] Sending message to room:', roomId);
    }
  }, [socket, isConnected]);

  // Start typing indicator
  const startTyping = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { roomId });
    }
  }, [socket, isConnected]);

  // Stop typing indicator
  const stopTyping = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { roomId });
    }
  }, [socket, isConnected]);

  // Mark messages as read
  const markAsRead = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('mark_read', { roomId });
    }
  }, [socket, isConnected]);

  // Subscribe to events
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  // Unsubscribe from events
  const off = useCallback((event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    connectionError,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
