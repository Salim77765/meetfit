import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Validate password strength
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return errors;
  };

  // Validate password with regex
  const validatePasswordWithRegex = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return passwordRegex.test(password);
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Register user
  const register = async (userData) => {
    try {
      setError(null);

      // Client-side validation
      if (!userData.username || userData.username.length < 3) {
        setError('Username must be at least 3 characters long');
        return false;
      }

      if (!validateEmail(userData.email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // Use regex validation for consistency with server-side validation
      if (!validatePasswordWithRegex(userData.password)) {
        const passwordErrors = validatePassword(userData.password);
        setError(passwordErrors.join('\n'));
        return false;
      }

      const res = await axios.post('/auth/register', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      if (errorMessage?.includes('already exists')) {
        setError('A user with this email or username already exists');
      } else if (errorMessage?.includes('Password')) {
        setError(errorMessage);
      } else if (errorMessage?.includes('Email')) {
        setError('Please enter a valid email address');
      } else if (errorMessage?.includes('Username')) {
        setError('Username must be at least 3 characters long');
      } else {
        setError('Registration failed. Please try again.');
      }
      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('/auth/login', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const res = await axios.put('/auth/profile', profileData);
      
      if (res.data.success) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  // Update profile image
  const updateProfileImage = async (formData) => {
    try {
      setError(null);
      const res = await axios.put('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Profile image update failed');
      return false;
    }
  };

  // Load user
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return false;
      }
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get('/auth/profile');
      
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updateProfileImage,
    loadUser,
    setUser,
    setIsAuthenticated,
    setLoading,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
