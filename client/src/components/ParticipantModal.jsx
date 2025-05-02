import { useState } from 'react';
import axios from 'axios';
import './ParticipantModal.css';

const ParticipantModal = ({ isOpen, onClose, participants }) => {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParticipantDetails = async (participantId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/auth/users/${participantId}`);
      if (response.data.success) {
        setSelectedParticipant(response.data.user);
      }
    } catch (err) {
      setError('Failed to fetch participant details');
      console.error('Error fetching participant details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedParticipant(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {selectedParticipant ? (
          <div className="participant-details">
            <button className="back-button" onClick={handleBack}>
              ← Back to List
            </button>
            <h3>{selectedParticipant.username}'s Profile</h3>
            {loading ? (
              <div className="loading">Loading details...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="profile-info">
                <div className="profile-section">
                  <img
                    src={selectedParticipant.profileImage ? 
                      `http://localhost:5000/uploads/${selectedParticipant.profileImage}` : 
                      '/default-profile.jpg'
                    }
                    alt="Profile"
                    className="profile-image"
                  />
                </div>
                <div className="profile-section">
                  <h4>About</h4>
                  <p>{selectedParticipant.bio || 'No bio provided'}</p>
                </div>
                <div className="profile-section">
                  <h4>Location</h4>
                  <p>{selectedParticipant.location || 'Not specified'}</p>
                </div>
                <div className="profile-section">
                  <h4>Interests</h4>
                  <div className="tags-container">
                    {selectedParticipant.interests?.length > 0 ? (
                      selectedParticipant.interests.map((interest, index) => (
                        <span key={index} className="tag">{interest}</span>
                      ))
                    ) : (
                      <p>No interests listed</p>
                    )}
                  </div>
                </div>
                <div className="profile-section">
                  <h4>Activity Preferences</h4>
                  <div className="tags-container">
                    {selectedParticipant.activityPreferences?.length > 0 ? (
                      selectedParticipant.activityPreferences.map((pref, index) => (
                        <span key={index} className="tag">{pref}</span>
                      ))
                    ) : (
                      <p>No preferences listed</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="participants-list">
            <h3>Activity Participants</h3>
            {participants.map((participant) => (
              <div
                key={participant._id}
                className="participant-item"
                onClick={() => fetchParticipantDetails(participant._id)}
              >
                <img
                  src={participant.profileImage ? 
                    `http://localhost:5000/uploads/${participant.profileImage}` : 
                    '/default-profile.jpg'
                  }
                  alt={participant.username}
                  className="participant-avatar"
                />
                <span className="participant-name">{participant.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantModal;