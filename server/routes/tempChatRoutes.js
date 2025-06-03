import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendTempMessage, getTempMessages } from '../controllers/tempChatController.js';

const router = express.Router();

// @route   POST /api/tempchat/:activityId
// @desc    Send a temporary chat message
// @access  Private
router.post('/:activityId', protect, sendTempMessage);

// @route   GET /api/tempchat/:activityId
// @desc    Get temporary chat messages for an activity
// @access  Private
router.get('/:activityId', protect, getTempMessages);

export default router;