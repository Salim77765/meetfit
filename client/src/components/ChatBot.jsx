import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatBot.css';
import chatbotService from '../services/chatbotService';

const ChatBot = ({ forcedOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(forcedOpen || false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your MeetFit Assistant. I can help you with your activities, provide recommendations, and answer your fitness questions.", type: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update isOpen when forcedOpen changes
  useEffect(() => {
    if (forcedOpen !== undefined) {
      setIsOpen(forcedOpen);
      // Focus the input when the chatbot is opened via the navigation bar
      if (forcedOpen) {
        setTimeout(() => {
          const input = document.querySelector('.chatbot-input input');
          if (input) {
            input.focus();
          }
        }, 300);
      }
    }
  }, [forcedOpen]);

  useEffect(() => {
    // Initialize once
    if (!isInitialized) {
      initializeChatbot();
      setIsInitialized(true);
    }
    
    // Check for activity reminders every minute
    const reminderInterval = setInterval(checkActivityReminders, 60000);
    
    // Fetch recommendations periodically
    const recommendationsInterval = setInterval(fetchRecommendations, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(reminderInterval);
      clearInterval(recommendationsInterval);
    };
  }, [isInitialized]);

  // Add a new effect to scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Initialize the chatbot
  const initializeChatbot = async () => {
    console.log('Initializing chatbot');
    try {
      // Initial check for activity reminders
      await checkActivityReminders();
      
      // Initial fetch for recommendations
      await fetchRecommendations();
    } catch (error) {
      console.error('Error initializing chatbot:', error);
    }
  };
  
  // Handle chatbot toggle
  const toggleChatbot = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (!newState && onClose) {
      onClose();
    }
  };

  const checkActivityReminders = async (activities) => {
    try {
      console.log('Checking for activity reminders');
      // If activities not provided, fetch them
      let userActivities = activities;
      if (!userActivities) {
        const response = await chatbotService.getJoinedActivities();
        // Check if we have activities in the response
        if (response && response.activities) {
          userActivities = response.activities;
        } else {
          // If no activities found, return early
          console.log('No activities found for reminders');
          return;
        }
      }

      const now = new Date();
      const upcomingActivities = userActivities.filter(activity => {
        const activityTime = new Date(activity.dateTime);
        const timeDiff = activityTime - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Return activities happening in the next 24 hours
        return hoursDiff > 0 && hoursDiff <= 24;
      });

      console.log(`Found ${upcomingActivities.length} upcoming activities for reminders`);
      if (upcomingActivities.length > 0) {
        // Create reminders for upcoming activities
        upcomingActivities.forEach(activity => {
          const activityTime = new Date(activity.dateTime);
          const timeDiff = activityTime - now;
          const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));
          
          const notification = {
            id: activity._id,
            type: 'reminder',
            title: `Reminder: ${activity.title}`,
            message: `You have "${activity.title}" in approximately ${hoursDiff} hour(s) at ${activity.location}.`,
            timestamp: new Date()
          };
          
          // Add to notifications if not already present
          setNotifications(prev => {
            if (!prev.some(n => n.id === notification.id && n.type === 'reminder')) {
              return [...prev, notification];
            }
            return prev;
          });
        });
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      console.log('Fetching activity recommendations');
      // Use chatbotService instead of direct axios call for consistency
      const response = await chatbotService.getRecommendations();
      
      // Process recommendations - response structure has recommendations array inside data
      if (response && response.recommendations) {
        const recommendations = response.recommendations;
        console.log(`Found ${recommendations.length} recommendations`);
        
        if (recommendations.length > 0) {
          // Create notifications for new recommendations
          recommendations.forEach(activity => {
            const notification = {
              id: activity._id,
              type: 'recommendation',
              title: 'Activity Recommendation',
              message: `New activity "${activity.title}" might interest you!`,
              timestamp: new Date()
            };
            
            // Add to notifications if not already present
            setNotifications(prev => {
              if (!prev.some(n => n.id === notification.id && n.type === 'recommendation')) {
                return [...prev, notification];
              }
              return prev;
            });
          });
        }
      } else {
        console.log('No recommendations found or invalid response format');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // We'll just silently fail for recommendations - no need to bother the user
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: inputMessage, type: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Handle activity queries directly if possible
    const lowercaseMessage = inputMessage.toLowerCase();
    
    // Activity query patterns
    const isActivityQuery = 
      (lowercaseMessage.includes('when') && 
       (lowercaseMessage.includes('activity') || lowercaseMessage.includes('activities'))) ||
      lowercaseMessage.includes('my activity') || 
      lowercaseMessage.includes('my activities') || 
      lowercaseMessage.includes('do i have');
    
    try {
      // For activity queries, first try to get activities 
      if (isActivityQuery) {
        try {
          console.log("Detected activity-related query, fetching activities first");
          const response = await chatbotService.getJoinedActivities();
          
          // Check if we have activities
          if (response && response.activities && response.activities.length > 0) {
            console.log(`Found ${response.activities.length} activities, sending to backend for processing`);
            // We have activities, so let the backend handle the full response
            await processBotResponse(inputMessage);
          } else {
            console.log("No activities found, responding with default message");
            // No activities, so respond directly
            setIsTyping(false);
            const noActivitiesMessage = getMockResponse(inputMessage);
            setMessages(prevMessages => [
              ...prevMessages, 
              { text: noActivitiesMessage, type: 'bot' }
            ]);
          }
        } catch (error) {
          console.error("Error fetching activities for query:", error);
          // API error, use mock response
          setIsTyping(false);
          const noActivitiesMessage = getMockResponse(inputMessage);
          setMessages(prevMessages => [
            ...prevMessages, 
            { text: noActivitiesMessage, type: 'bot' }
          ]);
        }
      } else {
        // Not an activity query, proceed with normal processing
        await processBotResponse(inputMessage);
      }
    } catch (error) {
      console.error("Error in message handling:", error);
      setIsTyping(false);
      
      // Provide more specific error messages based on the type of error
      const mockResponse = getMockResponse(inputMessage);
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: mockResponse, type: 'bot' }
      ]);
    }
  };
  
  // Helper function to provide mock responses when backend is unavailable
  const getMockResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Default fallback response
    let response = "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
    
    // Activity-related questions
    if (lowerMessage.includes('activity') || lowerMessage.includes('activities') || lowerMessage.includes('events')) {
      if (lowerMessage.includes('when') || lowerMessage.includes('do i have') || lowerMessage.includes('schedule') || lowerMessage.includes('upcoming')) {
        response = "I don't see any activities scheduled for you at the moment. Would you like me to help you find some activities to join? You can browse available activities in the Activities tab.";
      } 
      else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('find')) {
        response = "I'd be happy to help you find activities! You can browse available activities in the Activities tab. What type of activity interests you most? Some popular categories include yoga, running, cycling, and team sports.";
      }
      else if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('start')) {
        response = "Creating a new activity is easy! Just go to the 'My Activities' tab and click on the 'Create Activity' button. You'll be able to set the title, location, date, time, and other details for your activity.";
      }
      else if (lowerMessage.includes('join')) {
        response = "To join an activity, browse the Activities section and click on any activity that interests you. Then click the 'Join Activity' button on the activity details page.";
      }
    }
    // Greeting responses
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage === 'hi' || lowerMessage.includes('hey')) {
      response = "Hello! I'm your MeetFit Assistant. How can I help you today with your fitness activities? I can help you find activities, provide recommendations, or answer questions about the platform.";
    }
    // Help responses
    else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = "I can help you with: finding activities, providing workout recommendations, answering fitness questions, and keeping track of your scheduled activities. If you want to find an activity, just ask me for recommendations based on your interests!";
    }
    // Profile related questions
    else if (lowerMessage.includes('profile') || lowerMessage.includes('account') || lowerMessage.includes('settings')) {
      response = "You can manage your profile by clicking on the 'Profile' tab in the navigation bar. There you can update your personal information, interests, and activity preferences.";
    }
    // Workout advice
    else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
      response = "For personalized workout advice, I recommend joining group activities that match your fitness goals. Check the Activities tab for available options. What specific fitness goals are you working toward?";
    }
    
    return response;
  };
  
  // Helper function to process bot responses
  const processBotResponse = async (message) => {
    try {
      // Send message to backend for processing with Gemini API
      const response = await chatbotService.sendMessage(message);
      
      // Add bot response to chat
      setIsTyping(false);
      setMessages(prevMessages => [...prevMessages, { text: response.reply, type: 'bot' }]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      setIsTyping(false);
      
      // Get a mock response for common queries
      const mockResponse = getMockResponse(message);
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: mockResponse, type: 'bot' }
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Notification panel */}
      <div className="notification-panel">
        {notifications.map(notification => (
          <div key={`${notification.id}-${notification.type}`} className={`notification ${notification.type}`}>
            <div className="notification-header">
              <h4>{notification.title}</h4>
              <button onClick={() => dismissNotification(notification.id)}>×</button>
            </div>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
      
      {/* Chatbot button */}
      <button 
        className={`chatbot-button ${isOpen ? 'open' : ''} ${notifications.length > 0 ? 'has-notifications' : ''}`}
        onClick={toggleChatbot}
      >
        {isOpen ? '×' : '💬'}
        {!isOpen && notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
      </button>
      
      {/* Chatbot dialog */}
      {isOpen && (
        <div className="chatbot-dialog">
          <div className="chatbot-header">
            <h3>MeetFit Assistant</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              disabled={isTyping}
            />
            <button onClick={handleSendMessage} disabled={isTyping}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 