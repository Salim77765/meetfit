import { useState, useEffect } from 'react';
import axios from 'axios';
import './ActivityList.css';
import LocationPicker from './LocationPicker';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filters, setFilters] = useState({
    activityType: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('/auth/profile');
          if (res.data.success) {
            setCurrentUserId(res.data.user._id);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    getCurrentUser();
    fetchActivities();
  }, [filters]);

  const fetchActivities = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/activities?${queryParams}`);
      setActivities(response.data.activities);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async (activityId) => {
    try {
      await axios.post(`/activities/${activityId}/join`);
      fetchActivities(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join activity');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setFilters(prev => ({
      ...prev,
      location: locationData.address
    }));
  };

  if (loading) return <div className="loading">Loading activities...</div>;

  return (
    <div className="activity-list-container">
      <h2>Available Activities</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <select
          name="activityType"
          value={filters.activityType}
          onChange={handleFilterChange}
        >
          <option value="">All Activity Types</option>
          <option value="running">Running</option>
          <option value="cycling">Cycling</option>
          <option value="swimming">Swimming</option>
          <option value="yoga">Yoga</option>
          <option value="gym">Gym</option>
        </select>

        <LocationPicker
          initialValue={filters.location}
          onLocationSelect={handleLocationSelect}
        />

        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
        />

        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
        />
      </div>

      <div className="activities-grid">
        {activities.length === 0 ? (
          <p className="no-activities">No activities found. Try adjusting your filters.</p>
        ) : (
          activities.map(activity => (
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
              <button
                onClick={() => handleJoinActivity(activity._id)}
                disabled={
                  activity.participants.length >= activity.maxParticipants || 
                  (currentUserId && activity.participants.some(p => p._id === currentUserId))
                }
                className="join-button"
              >
                {activity.participants.length >= activity.maxParticipants
                  ? 'Full'
                  : currentUserId && activity.participants.some(p => p._id === currentUserId)
                    ? 'Already Joined'
                    : 'Join Activity'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityList;