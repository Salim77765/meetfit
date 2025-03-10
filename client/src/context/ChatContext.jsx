import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({ total: 0, byActivity: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.disconnect();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      setIsTyping(true);
      setTypingUser(data.user);

      // Clear typing indicator after 2 seconds
      setTimeout(() => {
        setIsTyping(false);
        setTypingUser(null);
      }, 2000);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket]);

  // Get chat by activity ID
  const getChatByActivity = async (activityId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`/chats/activity/${activityId}`);

      if (res.data.success) {
        setCurrentChat(res.data.chat);
        setMessages(res.data.chat.messages);

        // Join socket room for this activity
        if (socket) {
          socket.emit('join_chat', activityId);
        }

        return res.data.chat;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch chat');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (activityId, content) => {
    try {
      setError(null);

      const res = await axios.post(`/chats/activity/${activityId}/message`, { content });

      if (res.data.success) {
        // Add message to local state
        setMessages((prevMessages) => [...prevMessages, res.data.message]);

        // Emit message to socket
        if (socket) {
          socket.emit('send_message', {
            activityId,
            message: res.data.message
          });
        }

        return res.data.message;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      return null;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (activityId) => {
    try {
      setError(null);
      await axios.put(`/chats/activity/${activityId}/read`);

      // Update unread counts
      getUnreadMessageCount();

      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark messages as read');
      return false;
    }
  };

  // Get unread message count
  const getUnreadMessageCount = async () => {
    try {
      setError(null);
      const res = await axios.get('/chats/unread');

      if (res.data.success) {
        setUnreadCounts({
          total: res.data.totalUnread,
          byActivity: res.data.unreadByActivity
        });
        return res.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get unread message count');
      return { total: 0, byActivity: {} };
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (activityId, user) => {
    if (socket) {
      socket.emit('typing', { activityId, user });
    }
  };

  // Leave chat room
  const leaveChat = (activityId) => {
    if (socket) {
      socket.emit('leave_chat', activityId);
    }
    setCurrentChat(null);
    setMessages([]);
  };

  const value = {
    socket,
    currentChat,
    messages,
    unreadCounts,
    loading,
    error,
    isTyping,
    typingUser,
    getChatByActivity,
    sendMessage,
    markMessagesAsRead,
    getUnreadMessageCount,
    sendTypingIndicator,
    leaveChat,
    setError
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;