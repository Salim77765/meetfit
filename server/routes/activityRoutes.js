import express from 'express';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  getMyActivities,
  getJoinedActivities,
  getRecommendedActivities
} from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActivities);
router.get('/:id', getActivity);

// Protected routes
router.post('/', protect, createActivity);
router.put('/:id', protect, updateActivity);
router.delete('/:id', protect, deleteActivity);
router.post('/:id/join', protect, joinActivity);
router.post('/:id/leave', protect, leaveActivity);
router.get('/user/created', protect, getMyActivities);
router.get('/user/joined', protect, getJoinedActivities);
router.get('/user/recommended', protect, getRecommendedActivities);

export default router;