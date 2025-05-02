import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ParticipantModal from './ParticipantModal';
import './MyActivities.css';

const MyActivities = () => {
  const navigate = useNavigate();
  const [createdActivities, setCreatedActivities] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    fetchMyActivities();
  }, []);

  const fetchMyActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch activities created by the user
      const createdRes = await axios.get('/activities/user/created');
      setCreatedActivities(createdRes.data.activities);
      
      // Fetch activities joined by the user
      const joinedRes = await axios.get('/activities/user/joined');
      setJoinedActivities(joinedRes.data.activities);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch your activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await axios.delete(`/activities/${activityId}`);
      // Refresh the list after deletion
      fetchMyActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete activity');
    }
  };

  const handleLeaveActivity = async (activityId) => {
    try {
      await axios.post(`/activities/${activityId}/leave`);
      // Refresh the list after leaving
      fetchMyActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave activity');
    }
  };

  const handleCreateActivity = () => {
    navigate('/create-activity');
  };

  const handleViewParticipants = (activity) => {
    setSelectedActivity(activity);
    setShowParticipants(true);
  };

  if (loading) return <div className="loading">Loading your activities...</div>;

  return (
    <div className="my-activities-container">
      <div className="header-container">
        <h2>My Activities</h2>
        <button 
          className="create-activity-button"
          onClick={handleCreateActivity}
        >
          Create Activity
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created by Me ({createdActivities.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => setActiveTab('joined')}
        >
          Joined by Me ({joinedActivities.length})
        </button>
      </div>

      <div className="activities-grid">
        {activeTab === 'created' ? (
          createdActivities.length === 0 ? (
            <p className="no-activities">You haven't created any activities yet.</p>
          ) : (
            createdActivities.map(activity => (
              <div key={activity._id} className="activity-card">
                <h3>{activity.title}</h3>
                <p className="activity-type">{activity.activityType}</p>
                <p className="location">{activity.location}</p>
                <p className="datetime">
                  {new Date(activity.dateTime).toLocaleString()}
                </p>
                <p className="duration">{activity.duration} minutes</p>
                <p className="participants">
                  {activity.participants.length}/{activity.maxParticipants} participants
                </p>
                <p className="status">Status: {activity.status}</p>
                <div className="action-buttons">
                  <button 
                    onClick={() => handleViewParticipants(activity)}
                    className="view-participants-button"
                  >
                    View Participants
                  </button>
                  <button 
                    onClick={() => handleDeleteActivity(activity._id)}
                    className="delete-button"
                  >
                    Delete Activity
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          joinedActivities.length === 0 ? (
            <p className="no-activities">You haven't joined any activities yet.</p>
          ) : (
            joinedActivities.map(activity => (
              <div key={activity._id} className="activity-card">
                <h3>{activity.title}</h3>
                <p className="activity-type">{activity.activityType}</p>
                <p className="location">{activity.location}</p>
                <p className="datetime">
                  {new Date(activity.dateTime).toLocaleString()}
                </p>
                <p className="duration">{activity.duration} minutes</p>
                <p className="participants">
                  {activity.participants.length}/{activity.maxParticipants} participants
                </p>
                <p className="creator">Created by: {activity.creator.username}</p>
                <div className="action-buttons">
                  <button 
                    onClick={() => handleViewParticipants(activity)}
                    className="view-participants-button"
                  >
                    View Participants
                  </button>
                  <button 
                    onClick={() => handleLeaveActivity(activity._id)}
                    className="leave-button"
                  >
                    Leave Activity
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {showParticipants && selectedActivity && (
        <ParticipantModal
          isOpen={showParticipants}
          onClose={() => setShowParticipants(false)}
          participants={selectedActivity.participants}
        />
      )}
    </div>
  );
};

export default MyActivities;