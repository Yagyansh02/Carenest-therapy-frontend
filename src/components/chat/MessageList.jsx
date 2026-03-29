import { Check, CheckCheck } from 'lucide-react';

export const MessageList = ({ messages, currentUserId }) => {
  // Format message time
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header
  const formatDateHeader = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p className="text-center">No messages yet</p>
        <p className="text-sm text-center mt-1 text-gray-400">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center justify-center my-4">
            <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
              {formatDateHeader(dateMessages[0].createdAt)}
            </span>
          </div>

          {/* Messages for this date */}
          <div className="space-y-2">
            {dateMessages.map((message, index) => {
              const isOwn = message.senderId._id === currentUserId || 
                           message.senderId === currentUserId;
              const showAvatar = index === 0 || 
                dateMessages[index - 1].senderId._id !== message.senderId._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[75%] ${
                      isOwn ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar (for received messages) */}
                    {!isOwn && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                        {message.senderId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8" />}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-[#748DAE] text-white rounded-br-md'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      {/* System message styling */}
                      {message.messageType === 'system' ? (
                        <p className="text-sm italic text-center text-gray-500">
                          {message.content}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                isOwn ? 'text-white/70' : 'text-gray-400'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </span>
                            {/* Read status (for sent messages) */}
                            {isOwn && (
                              <span className="text-white/70">
                                {message.isRead ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
