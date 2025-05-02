import axios from 'axios';

// We need to handle two potential scenarios:
// 1. If axios.defaults.baseURL already includes '/api' (from App.jsx)
// 2. If we're creating a new instance with just the base domain

// Get the base URL without '/api' suffix
const BASE_DOMAIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');
console.log('Chatbot service using base domain:', BASE_DOMAIN);

// Create our own axios instance with the correct base URL (without /api)
const api = axios.create({
  baseURL: BASE_DOMAIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to each request if token exists
api.interceptors.request.use(
  (config) => {
    // Add debugging to see each request
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const chatbotService = {
  /**
   * Send a message to the chatbot
   * @param {string} message - User's message
   * @returns {Promise} - API response
   */
  sendMessage: async (message) => {
    try {
      console.log('Sending message to chatbot API:', message);
      const response = await api.post('/api/chatbot/message', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  },

  /**
   * Get activity recommendations based on user preferences
   * @returns {Promise} - API response with recommendations
   */
  getRecommendations: async () => {
    try {
      console.log('Fetching activity recommendations');
      const response = await api.get('/api/activities/user/recommended');
      console.log('Recommendations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  /**
   * Get user's joined activities
   * @returns {Promise} - API response with user's activities
   */
  getJoinedActivities: async () => {
    try {
      console.log('Fetching joined activities');
      const response = await api.get('/api/activities/user/joined');
      console.log('Joined activities response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching joined activities:', error);
      throw error;
    }
  }
};

export default chatbotService; 