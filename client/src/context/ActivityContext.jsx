import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ActivityContext = createContext();

export const useActivity = () => useContext(ActivityContext);

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all activities
  const getActivities = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const res = await axios.get(`/activities?${queryParams.toString()}`);
      
      if (res.data.success) {
        setActivities(res.data.activities);
      }
      return res.data.activities;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch activities');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single activity
  const getActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`/activities/${id}`);
      
      if (res.data.success) {
        setCurrentActivity(res.data.activity);
        return res.data.activity;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch activity');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create activity
  const createActivity = async (activityData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/activities', activityData);
      
      if (res.data.success) {
        setMyActivities([...myActivities, res.data.activity]);
        return res.data.activity;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create activity');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update activity
  const updateActivity = async (id, activityData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put(`/activities/${id}`, activityData);
      
      if (res.data.success) {
        setMyActivities(myActivities.map(activity => 
          activity._id === id ? res.data.activity : activity
        ));
        setCurrentActivity(res.data.activity);
        return res.data.activity;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update activity');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete activity
  const deleteActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.delete(`/activities/${id}`);
      
      if (res.data.success) {
        setMyActivities(myActivities.filter(activity => activity._id !== id));
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete activity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Join activity
  const joinActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`/activities/${id}/join`);
      
      if (res.data.success) {
        // Update activities list
        setActivities(activities.map(activity => 
          activity._id === id ? res.data.activity : activity
        ));
        
        // Update current activity if viewing
        if (currentActivity && currentActivity._id === id) {
          setCurrentActivity(res.data.activity);
        }
        
        // Add to joined activities
        setJoinedActivities([...joinedActivities, res.data.activity]);
        
        return res.data.activity;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join activity');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Leave activity
  const leaveActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`/activities/${id}/leave`);
      
      if (res.data.success) {
        // Remove from joined activities
        setJoinedActivities(joinedActivities.filter(activity => activity._id !== id));
        
        // Update activities list
        getActivities();
        
        // Update current activity if viewing
        if (currentActivity && currentActivity._id === id) {
          getActivity(id);
        }
        
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave activity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get my created activities
  const getMyActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get('/activities/user/created');
      
      if (res.data.success) {
        setMyActivities(res.data.activities);
        return res.data.activities;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your activities');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get activities I've joined
  const getJoinedActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get('/activities/user/joined');
      
      if (res.data.success) {
        setJoinedActivities(res.data.activities);
        return res.data.activities;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch joined activities');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    activities,
    myActivities,
    joinedActivities,
    currentActivity,
    loading,
    error,
    getActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    joinActivity,
    leaveActivity,
    getMyActivities,
    getJoinedActivities,
    setError
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export default ActivityContext;