import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../utils/supabaseClient';

export function ChatSystem({ duelId }) {
  const { address } = useAccount();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const emotes = ['👍', '👎', '😄', '😢', '😠', '🔥', '⚡', '💀'];

  useEffect(() => {
    if (!duelId) return;

    // Subscribe to chat messages
    const channel = supabase
      .channel(`chat_${duelId}`)
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        setMessages(prev => [...prev, payload.payload]);
      })
      .on('broadcast', { event: 'emote' }, (payload) => {
        setMessages(prev => [...prev, {
          ...payload.payload,
          isEmote: true
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [duelId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !duelId) return;

    const message = {
      id: Date.now(),
      address,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    supabase
      .channel(`chat_${duelId}`)
      .send({
        type: 'broadcast',
        event: 'chat_message',
        payload: message
      });

    setNewMessage('');
  };

  const sendEmote = (emote) => {
    if (!duelId) return;

    const emoteMessage = {
      id: Date.now(),
      address,
      text: emote,
      timestamp: new Date().toISOString()
    };

    supabase
      .channel(`chat_${duelId}`)
      .send({
        type: 'broadcast',
        event: 'emote',
        payload: emoteMessage
      });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-10"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-gray-800/90 border border-gray-600 rounded-lg shadow-xl z-10 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-600">
        <h3 className="text-white font-bold">Chat</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <div key={message.id} className={`text-sm ${message.address === address ? 'text-blue-300' : 'text-gray-300'}`}>
            <span className="text-xs text-gray-500">
              {message.address.substring(0, 6)}...
            </span>
            {message.isEmote ? (
              <span className="text-2xl ml-2">{message.text}</span>
            ) : (
              <span className="ml-2">{message.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Emotes */}
      <div className="p-2 border-t border-gray-600">
        <div className="flex space-x-1 mb-2">
          {emotes.map((emote) => (
            <button
              key={emote}
              onClick={() => sendEmote(emote)}
              className="text-lg hover:bg-gray-700 p-1 rounded"
            >
              {emote}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-600">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
