import { useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const ChatSidebar = ({ 
  chatRooms, 
  activeRoom, 
  user, 
  onSelectRoom,
  onRoomUpdate 
}) => {
  const { on, off } = useSocket();

  // Listen for real-time updates
  useEffect(() => {
    const handleNewMessage = (data) => {
      const { roomId, message } = data;
      // Update room's last message preview and unread count
      onRoomUpdate({
        _id: roomId,
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.content.substring(0, 100),
      });
    };

    on('new_message', handleNewMessage);
    return () => off('new_message', handleNewMessage);
  }, [on, off, onRoomUpdate]);

  // Get the other participant's info
  const getOtherParticipant = (room) => {
    if (user.role === 'patient') {
      return room.therapistId;
    }
    return room.patientId;
  };

  // Get unread count for current user
  const getUnreadCount = (room) => {
    if (user.role === 'patient') {
      return room.patientUnreadCount || 0;
    }
    return room.therapistUnreadCount || 0;
  };

  // Format last message time
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Today
    if (diff < 86400000 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Yesterday
    if (diff < 172800000) {
      return 'Yesterday';
    }
    // This week
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    // Older
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#748DAE] focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-center">No conversations yet</p>
            <p className="text-sm text-center mt-1 text-gray-400">
              Book a session with a therapist to start chatting
            </p>
          </div>
        ) : (
          chatRooms.map((room) => {
            const otherParticipant = getOtherParticipant(room);
            const unreadCount = getUnreadCount(room);
            const isActive = activeRoom?._id === room._id;

            return (
              <button
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                  isActive ? 'bg-[#9ECAD6]/20 border-l-4 border-l-[#748DAE]' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#748DAE] flex items-center justify-center text-white font-semibold text-lg">
                    {otherParticipant?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {/* Online indicator would go here */}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {otherParticipant?.fullName || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(room.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {room.lastMessagePreview || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-[#748DAE] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {otherParticipant?.role || ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
