import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ProfilePage from './components/ProfilePage';
import ActivityList from './components/ActivityList';
import MyActivities from './components/MyActivities';
import CreateActivity from './components/CreateActivity';
import ActivityDetail from './components/ActivityDetail';
import HomePage from './components/HomePage';
import MobileMenu from './components/MobileMenu';
import './App.css';

// Set default axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, user, loading, logout, loadUser } = useAuth();

  // Check if user is authenticated on app load
  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>MeetFit</h1>
          <nav className="desktop-nav">
            <ul>
              <li><a href="/">Home</a></li>
              {isAuthenticated ? (
                <>
                  <li><a href="/activities">Activities</a></li>
                  <li><a href="/my-activities">My Activities</a></li>
                  <li><a href="/profile">Profile</a></li>
                  <li>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}>Logout</a>
                  </li>
                </>
              ) : (
                <>
                  <li><a href="/login">Login</a></li>
                  <li><a href="/register">Register</a></li>
                </>
              )}
            </ul>
          </nav>
          <MobileMenu 
            isAuthenticated={isAuthenticated} 
            handleLogout={handleLogout} 
          />
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" replace /> : <LoginForm />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/profile" replace /> : <RegisterForm />} />
            <Route path="/activities" element={
              <ProtectedRoute>
                <ActivityList />
              </ProtectedRoute>
            } />
            <Route path="/my-activities" element={
              <ProtectedRoute>
                <MyActivities />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/create-activity" element={
              <ProtectedRoute>
                <CreateActivity />
              </ProtectedRoute>
            } />
            <Route path="/activities/:id" element={
              <ProtectedRoute>
                <ActivityDetail />
              </ProtectedRoute>
            } />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} MeetFit. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
