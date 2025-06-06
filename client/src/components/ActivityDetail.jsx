import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ActivityDetail.css';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [tempMessages, setTempMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchActivityAndUser = async () => {
      try {
        setLoading(true);
        
        // Fetch activity details
        const activityRes = await axios.get(`/activities/${id}`);
        if (activityRes.data.success) {
          setActivity(activityRes.data.activity);
        } else {
          setError('Activity not found');
        }

        // Get current user ID
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const userRes = await axios.get('/auth/profile');
          if (userRes.data.success) {
            const userId = userRes.data.user._id;
            setCurrentUserId(userId);
            
            // Check if user has joined this activity
            if (activityRes.data.activity && activityRes.data.activity.participants) {
              setHasJoined(activityRes.data.activity.participants.some(p => p._id === userId));
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityAndUser();
  }, [id]);

  useEffect(() => {
    const fetchTempMessages = async () => {
      if (hasJoined && activity) {
        try {
          const res = await axios.get(`/tempchat/${id}`);
          setTempMessages(res.data);
        } catch (err) {
          console.error('Failed to fetch temporary messages:', err);
        }
      }
    };

    fetchTempMessages();

    // Set up an interval to refresh messages every 5 seconds
    const messageInterval = setInterval(fetchTempMessages, 5000);

    // Clean up interval on component unmount or when activity/hasJoined changes
    return () => clearInterval(messageInterval);
  }, [id, hasJoined, activity]);

  const handleJoinActivity = async () => {
    try {
      const res = await axios.post(`/activities/${id}/join`);
      if (res.data.success) {
        setActivity(res.data.activity);
        setHasJoined(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join activity');
    }
  };

  const handleLeaveActivity = async () => {
    try {
      const res = await axios.post(`/activities/${id}/leave`);
      if (res.data.success) {
        setActivity(res.data.activity);
        setHasJoined(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave activity');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const res = await axios.post(`/tempchat/${id}`, { message: newMessage });
      if (res.data) {
        setTempMessages((prevMessages) => [...prevMessages, res.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <div className="loading">Loading activity details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!activity) return <div className="error-message">Activity not found</div>;

  const isCreator = currentUserId && activity.creator && activity.creator._id === currentUserId;
  const isFull = activity.participants && activity.participants.length >= activity.maxParticipants;

  return (
    <div className="activity-detail-container">
      <button className="back-button" onClick={handleBack}>
        &larr; Back
      </button>
      
      <div className="activity-detail-card">
        <h2>{activity.title}</h2>
        
        <div className="activity-meta">
          <div className="meta-item">
            <span className="meta-label">Activity Type:</span>
            <span className="meta-value">{activity.activityType}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Location:</span>
            <span className="meta-value">{activity.location}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Date & Time:</span>
            <span className="meta-value">{new Date(activity.dateTime).toLocaleString()}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="meta-value">{activity.duration} minutes</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Participants:</span>
            <span className="meta-value">
              {activity.participants ? activity.participants.length : 0}/{activity.maxParticipants}
            </span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Created by:</span>
            <span className="meta-value">{activity.creator ? activity.creator.username : 'Unknown'}</span>
          </div>
        </div>
        
        <div className="activity-description">
          <h3>Description</h3>
          <p>{activity.description}</p>
        </div>
        
        {!isCreator && (
          <div className="action-buttons">
            {hasJoined ? (
              <button 
                className="leave-button" 
                onClick={handleLeaveActivity}
              >
                Leave Activity
              </button>
            ) : (
              <button 
                className="join-button" 
                onClick={handleJoinActivity}
                disabled={isFull}
              >
                {isFull ? 'Activity Full' : 'Join Activity'}
              </button>
            )}
          </div>
        )}
        
        <div className="participants-section">
          <h3>Participants ({activity.participants ? activity.participants.length : 0})</h3>
          {activity.participants && activity.participants.length > 0 ? (
            <ul className="participants-list">
              {activity.participants.map(participant => (
                <li key={participant._id} className="participant-item">
                  {participant.username}
                </li>
              ))}
            </ul>
          ) : (
            <p>No participants yet. Be the first to join!</p>
          )}
        </div>

        {hasJoined && (
          <div className="temp-chat-section">
            <h3>Temporary Chat (24-hour auto-deletion)</h3>
            <div className="chat-messages">
              {tempMessages.length > 0 ? (
                tempMessages.map((msg) => (
                  <div key={msg._id} className="chat-message">
                    <strong>{msg.sender.username}:</strong> {msg.message}
                    <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <p>No messages yet. Start the conversation!</p>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button type="submit" className="send-message-button">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
