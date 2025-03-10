import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterForm.css';
import LocationPicker from './LocationPicker';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    location: '',
    interests: [],
    activityPreferences: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      coordinates: locationData.coordinates
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const success = await register(registerData);
      
      if (success) {
        navigate('/profile');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <h2>Create Your Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password*</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password*</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </div>

        <div className="form-group">
          <label htmlFor="interests">Interests (comma separated)</label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests.join(', ')}
            onChange={(e) => handleArrayChange(e, 'interests')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="activityPreferences">Activity Preferences (comma separated)</label>
          <input
            type="text"
            id="activityPreferences"
            name="activityPreferences"
            value={formData.activityPreferences.join(', ')}
            onChange={(e) => handleArrayChange(e, 'activityPreferences')}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;