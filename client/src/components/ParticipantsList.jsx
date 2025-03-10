import React from 'react';
import { Link } from 'react-router-dom';
import './ParticipantsList.css';

const ParticipantsList = ({ participants }) => {
  return (
    <div className="participants-list-container">
      <h3 className="participants-list-title">Participants</h3>
      <div className="participants-grid">
        {participants.map((participant) => (
          <Link
            key={participant._id}
            to={`/profile/${participant._id}`}
            className="participant-card"
          >
            <img
              src={participant.profilePhoto || '/default-profile.png'}
              alt={`${participant.name}'s profile`}
              className="participant-photo"
            />
            <p className="participant-name">{participant.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;
