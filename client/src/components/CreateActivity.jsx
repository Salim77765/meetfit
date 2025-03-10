import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LocationPicker from './LocationPicker';
import './CreateActivity.css';

const CreateActivity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityType: '',
    location: '',
    dateTime: '',
    duration: '',
    maxParticipants: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('/activities', formData);
      setSuccess(true);
      // Redirect to My Activities page after successful creation
      navigate('/my-activities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-activity-container">
      <h2>Create New Activity</h2>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Activity created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-activity-form">
        <div className="form-group">
          <label htmlFor="title">Activity Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="activityType">Activity Type</label>
          <select
            id="activityType"
            name="activityType"
            value={formData.activityType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Activity Type</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="swimming">Swimming</option>
            <option value="yoga">Yoga</option>
            <option value="gym">Gym</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <LocationPicker
            initialValue={formData.location}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateTime">Date and Time</label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxParticipants">Maximum Participants</label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Activity'}
        </button>
      </form>
    </div>
  );
};

export default CreateActivity;