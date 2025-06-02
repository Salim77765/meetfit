import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
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
import { cleanupExpiredActivities } from '../utils/activityCleanup.js';

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

// Admin route for manual cleanup (should be restricted to admins in production)
router.post('/admin/cleanup-expired', protect, async (req, res) => {
  try {
    await cleanupExpiredActivities();
    res.status(200).json({
      success: true,
      message: 'Expired activities cleanup completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up expired activities',
      error: error.message
    });
  }
});

export default router;