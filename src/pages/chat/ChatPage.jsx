import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, ArrowLeft, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { chatService } from '../../api/chat';
import { useSocket } from '../../context/SocketContext';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { logger } from '../../utils/logger';

export const ChatPage = () => {
  const { roomId: urlRoomId, recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isConnected, connectionError } = useSocket();

  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(true);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowSidebar(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chat rooms
  const fetchChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getChatRooms();
      setChatRooms(response.data.data || []);
    } catch (err) {
      logger.error('Failed to fetch chat rooms:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Handle recipient ID from URL (direct chat link)
  useEffect(() => {
    const initializeChat = async () => {
      if (recipientId) {
        try {
          const response = await chatService.getOrCreateChatRoom(recipientId);
          const room = response.data.data;
          setActiveRoom(room);
          
          // Add to rooms if not exists
          setChatRooms((prev) => {
            const exists = prev.find((r) => r._id === room._id);
            if (!exists) return [room, ...prev];
            return prev;
          });
          
          if (isMobileView) setShowSidebar(false);
          navigate(`/chat/${room._id}`, { replace: true });
        } catch (err) {
          logger.error('Failed to create/get chat room:', err);
          setError(err.response?.data?.message || 'Failed to start conversation');
        }
      }
    };

    initializeChat();
  }, [recipientId, navigate, isMobileView]);

  // Handle room ID from URL
  useEffect(() => {
    if (urlRoomId && chatRooms.length > 0) {
      const room = chatRooms.find((r) => r._id === urlRoomId);
      if (room) {
        setActiveRoom(room);
        if (isMobileView) setShowSidebar(false);
      }
    }
  }, [urlRoomId, chatRooms, isMobileView]);

  // Select a room
  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    navigate(`/chat/${room._id}`);
    if (isMobileView) setShowSidebar(false);
  };

  // Go back to sidebar (mobile)
  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setActiveRoom(null);
    navigate('/chat');
  };

  // Update room in list when new message arrives
  const handleRoomUpdate = useCallback((updatedRoom) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room._id === updatedRoom._id ? { ...room, ...updatedRoom } : room
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#748DAE] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobileView && activeRoom && !showSidebar && (
            <button
              onClick={handleBackToSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <MessageSquare className="w-6 h-6 text-[#748DAE]" />
          <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <WifiOff className="w-4 h-4" />
              <span className="hidden sm:inline">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{connectionError}</span>
        </div>
      )}

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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {(!isMobileView || showSidebar) && (
          <ChatSidebar
            chatRooms={chatRooms}
            activeRoom={activeRoom}
            user={user}
            onSelectRoom={handleSelectRoom}
            onRoomUpdate={handleRoomUpdate}
          />
        )}

        {/* Chat Window */}
        {(!isMobileView || !showSidebar) && (
          <ChatWindow
            room={activeRoom}
            user={user}
            onRoomUpdate={handleRoomUpdate}
          />
        )}
      </div>
    </div>
  );
};
