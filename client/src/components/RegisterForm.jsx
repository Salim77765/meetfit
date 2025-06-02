import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterForm.css';
import LocationPicker from './LocationPicker';
import { FaCamera } from 'react-icons/fa';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    location: '',
    interests: [],
    activityPreferences: [],
    profilePhoto: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return null;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size should not exceed 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePhoto: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        navigate('/home');
      } else {
        // Use the error from AuthContext
        setError(authError || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      setError('Registration failed. Please try again later.');
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
            minLength={8}
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

        <div className="form-group photo-upload-group">
          <label>Profile Photo</label>
          <div className="photo-upload-container">
            <input
              type="file"
              id="profilePhoto"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
            <label htmlFor="profilePhoto" className="photo-upload-label">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">
                  <FaCamera />
                  <span>Upload Photo</span>
                </div>
              )}
            </label>
          </div>
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