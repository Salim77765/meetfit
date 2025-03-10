import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

const HomePage = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [popularActivities, setPopularActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch some popular activities to display on the home page
    const fetchPopularActivities = async () => {
      try {
        const response = await axios.get('/activities?limit=3');
        if (response.data.success) {
          setPopularActivities(response.data.activities.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching popular activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularActivities();
  }, []);

  const handleCreateActivity = () => {
    navigate('/create-activity');
  };

  const handleBrowseActivities = () => {
    if (isAuthenticated) {
      navigate('/activities');
    } else {
      navigate('/login');
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-page-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Workout Partner</h1>
          <p className="hero-subtitle">
            MeetFit connects fitness enthusiasts to train together, stay motivated, and achieve goals.
          </p>
          {isAuthenticated ? (
            <div className="hero-buttons">
              <button className="primary-button" onClick={handleCreateActivity}>
                Create Activity
              </button>
              <button className="secondary-button" onClick={handleBrowseActivities}>
                Browse Activities
              </button>
            </div>
          ) : (
            <div className="hero-buttons">
              <button className="primary-button" onClick={handleSignUp}>
                Sign Up Free
              </button>
              <button className="secondary-button" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose MeetFit?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Find Workout Partners</h3>
            <p>Connect with like-minded fitness enthusiasts in your area</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏃‍♂️</div>
            <h3>Diverse Activities</h3>
            <p>From running to yoga, find the perfect activity for you</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Schedule Workouts</h3>
            <p>Create and join activities that fit your schedule</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Stay Motivated</h3>
            <p>Achieve your fitness goals with community support</p>
          </div>
        </div>
      </section>

      {isAuthenticated && popularActivities.length > 0 && (
        <section className="popular-activities-section">
          <h2>Popular Activities</h2>
          <div className="activities-preview">
            {popularActivities.map(activity => (
              <div key={activity._id} className="activity-preview-card">
                <h3>{activity.title}</h3>
                <p className="activity-type">{activity.activityType}</p>
                <p className="location">{activity.location}</p>
                <p className="datetime">
                  {new Date(activity.dateTime).toLocaleString()}
                </p>
                <button 
                  onClick={() => navigate(`/activities/${activity._id}`)}
                  className="view-activity-button"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          <div className="view-all-container">
            <button 
              onClick={handleBrowseActivities}
              className="view-all-button"
            >
              View All Activities
            </button>
          </div>
        </section>
      )}

      <section className="cta-section">
        <div className="cta-content">
          <h2>{isAuthenticated ? 'Ready to get active?' : 'Join our fitness community today!'}</h2>
          <p>
            {isAuthenticated 
              ? 'Create a new activity or join one that interests you.'
              : 'Sign up for free and start connecting with fitness partners in your area.'}
          </p>
          {isAuthenticated ? (
            <button className="primary-button" onClick={handleCreateActivity}>
              Create Activity
            </button>
          ) : (
            <button className="primary-button" onClick={handleSignUp}>
              Sign Up Now
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;