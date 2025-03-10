import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ParticipantsList from './ParticipantsList';
import LocationMap from './LocationMap';
import './ActivityDetails.css';

const ActivityDetails = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`/api/activities/${id}`);
        setActivity(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load activity details');
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!activity) {
    return <div className="error-message">Activity not found</div>;
  }

  return (
    <div className="activity-details-container">
      <h2>{activity.title}</h2>
      
      <div className="activity-info-section">
        <div className="activity-info-item">
          <span className="info-label">Date:</span>
          <span className="info-value">
            {new Date(activity.date).toLocaleDateString()}
          </span>
        </div>
        
        <div className="activity-info-item">
          <span className="info-label">Time:</span>
          <span className="info-value">
            {new Date(activity.date).toLocaleTimeString()}
          </span>
        </div>

        <div className="activity-info-item">
          <span className="info-label">Type:</span>
          <span className="info-value">{activity.type}</span>
        </div>

        <div className="activity-info-item">
          <span className="info-label">Difficulty:</span>
          <span className="info-value">{activity.difficulty}</span>
        </div>
      </div>

      <div className="activity-description">
        <h3>Description</h3>
        <p>{activity.description}</p>
      </div>

      <LocationMap location={activity.location} />

      <ParticipantsList participants={activity.participants} />
    </div>
  );
};

export default ActivityDetails;