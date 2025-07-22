import React, { useState, useEffect, useRef } from 'react';
import { useMultisynq } from '../contexts/MultisynqContext';

const GlobalChat = ({ isVisible, onToggle }) => {
  const { chatSession } = useMultisynq();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [isNicknameSet, setIsNicknameSet] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatSession || !chatSession.view) return;

    // Subscribe to chat events
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessageHistory = (messageHistory) => {
      setMessages(messageHistory);
    };

    const handleUserListUpdated = (userList) => {
      setUsers(userList);
    };

    const handleUserJoined = (data) => {
      // Optional: Show join notification
      console.log(`${data.nickname} joined the chat`);
    };

    const handleUserLeft = (data) => {
      // Optional: Show leave notification
      console.log(`${data.nickname} left the chat`);
    };

    const handleNicknameChanged = (data) => {
      // Optional: Show nickname change notification
      console.log(`${data.oldNickname} is now ${data.newNickname}`);
    };

    // Subscribe to events
    chatSession.view.subscribe(chatSession.view.sessionId, "newMessage", handleNewMessage);
    chatSession.view.subscribe(chatSession.view.sessionId, "messageHistory", handleMessageHistory);
    chatSession.view.subscribe(chatSession.view.sessionId, "userListUpdated", handleUserListUpdated);
    chatSession.view.subscribe(chatSession.view.sessionId, "userJoined", handleUserJoined);
    chatSession.view.subscribe(chatSession.view.sessionId, "userLeft", handleUserLeft);
    chatSession.view.subscribe(chatSession.view.sessionId, "nicknameChanged", handleNicknameChanged);

    return () => {
      // Cleanup subscriptions - Multisynq handles this automatically when view is destroyed
      console.log("Chat component unmounting - subscriptions will be cleaned up automatically");
    };
  }, [chatSession]);

  const sendMessage = () => {
    if (!chatSession || !inputMessage.trim()) return;

    chatSession.view.publish(chatSession.view.sessionId, "sendMessage", {
      userId: chatSession.view.viewId,
      text: inputMessage.trim(),
      timestamp: Date.now()
    });

    setInputMessage('');
  };

  const setUserNickname = () => {
    if (!chatSession || !nickname.trim()) return;

    chatSession.view.publish(chatSession.view.sessionId, "setNickname", {
      userId: chatSession.view.viewId,
      nickname: nickname.trim()
    });

    setIsNicknameSet(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isNicknameSet) {
        setUserNickname();
      } else {
        sendMessage();
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!chatSession) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
        <p>Connecting to chat...</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        aria-label="Toggle Global Chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl flex flex-col z-40">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <h3 className="font-semibold">Global Chat</h3>
              <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                {users.length} online
              </span>
            </div>
            <button
              onClick={onToggle}
              className="text-blue-200 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nickname Setup */}
          {!isNicknameSet && (
            <div className="p-4 bg-gray-800 border-b border-gray-600">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Set your nickname:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter nickname..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={50}
                  />
                  <button
                    onClick={setUserNickname}
                    disabled={!nickname.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-600"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === chatSession.view.viewId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                    message.userId === chatSession.view.viewId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100 border border-gray-600'
                  }`}
                >
                  {message.userId !== chatSession.view.viewId && (
                    <div className="font-semibold text-xs text-gray-300 mb-1">
                      {message.nickname}
                    </div>
                  )}
                  <div className="break-words">{message.text}</div>
                  <div 
                    className={`text-xs mt-1 ${
                      message.userId === chatSession.view.viewId 
                        ? 'text-blue-200' 
                        : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.serverTime)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {isNicknameSet && (
            <div className="p-3 border-t border-gray-600 bg-gray-800 rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GlobalChat;
