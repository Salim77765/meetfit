import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';
import LocationPicker from './LocationPicker';
import LocationMap from './LocationMap';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    coordinates: null,
    interests: [],
    activityPreferences: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/auth/profile');
        
        if (res.data.success) {
          setUser(res.data.user);
          setFormData({
            name: res.data.user.name || '',
            bio: res.data.user.bio || '',
            location: res.data.user.location || '',
            interests: res.data.user.interests || [],
            activityPreferences: res.data.user.activityPreferences || []
          });
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Profile loading error:', err);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // First update the profile information
      const profileRes = await axios.put('/auth/profile', formData);
      
      if (profileRes.data.success) {
        // If there's a new image, upload it
        if (fileInputRef.current && fileInputRef.current.files[0]) {
          const imageFormData = new FormData();
          imageFormData.append('profileImage', fileInputRef.current.files[0]);
          
          const imageRes = await axios.put('/auth/profile/image', imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (imageRes.data.success) {
            // Update user state with the latest user data including the new profile image
            setUser(imageRes.data.user);
            // Clear the image preview since we're now using the actual uploaded image
            setImagePreview(null);
          }
        } else {
          setUser(profileRes.data.user);
        }
        
        // Ensure edit mode is turned off and image preview is cleared
        setEditMode(false);
        // The imagePreview is already cleared in the image upload section if needed
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="profile-page-container">
      <h2>Your Profile</h2>
      {error && <div className="error-message">{error}</div>}
      
      {!editMode ? (
        <div className="profile-details">
          <div className="profile-header">
            <div className="profile-image-container">
              <img 
                src={user?.profileImage ? `http://localhost:5000/uploads/${user.profileImage}?t=${new Date().getTime()}` : '/default-profile.jpg'} 
                alt="Profile" 
                className="profile-image" 
              />
            </div>
            <div className="profile-info">
              <h3>{user?.username}</h3>
              <p className="profile-email">{user?.email}</p>
            </div>
            <button 
              className="edit-button"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          </div>
          
          <div className="profile-section">
            <h4>Personal Information</h4>
            <div className="profile-field">
              <span className="field-label">Name:</span>
              <span className="field-value">{user?.name || 'Not provided'}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Bio:</span>
              <p className="field-value bio-text">{user?.bio || 'No bio provided'}</p>
            </div>
            <div className="profile-field">
              <span className="field-label">Location:</span>
              <span className="field-value">{user?.location || 'Not provided'}</span>
              {user?.location && (
                <LocationMap address={user.location} coordinates={user.coordinates} />
              )}
            </div>
          </div>
          
          <div className="profile-section">
            <h4>Interests & Preferences</h4>
            <div className="profile-field">
              <span className="field-label">Interests:</span>
              <div className="tags-container">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span key={index} className="tag">{interest}</span>
                  ))
                ) : (
                  <span className="field-value">No interests added</span>
                )}
              </div>
            </div>
            <div className="profile-field">
              <span className="field-label">Activity Preferences:</span>
              <div className="tags-container">
                {user?.activityPreferences && user.activityPreferences.length > 0 ? (
                  user.activityPreferences.map((pref, index) => (
                    <span key={index} className="tag">{pref}</span>
                  ))
                ) : (
                  <span className="field-value">No preferences added</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-edit-form" encType="multipart/form-data">
          <div className="form-group profile-image-edit-group">
            <label>Profile Photo</label>
            <div className="profile-image-edit-container">
              <img 
                src={imagePreview || (user?.profileImage ? `http://localhost:5000/uploads/${user.profileImage}?t=${new Date().getTime()}` : '/default-profile.jpg')} 
                alt="Profile" 
                className="profile-image-preview" 
              />
              <div className="profile-image-overlay" onClick={() => fileInputRef.current.click()}>
                <span>Change Photo</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
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
              maxLength={250}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <LocationPicker 
              initialValue={formData.location} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="interests">Interests (comma-separated)</label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={formData.interests.join(', ')}
              onChange={(e) => handleArrayChange(e, 'interests')}
              placeholder="e.g. running, yoga, hiking"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="activityPreferences">Activity Preferences (comma-separated)</label>
            <input
              type="text"
              id="activityPreferences"
              name="activityPreferences"
              value={formData.activityPreferences.join(', ')}
              onChange={(e) => handleArrayChange(e, 'activityPreferences')}
              placeholder="e.g. morning workouts, group activities"
            />
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="submit-button">Save Changes</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;