import express from 'express';
import {
  getChatByActivity,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes are protected
router.get('/activity/:activityId', protect, getChatByActivity);
router.post('/activity/:activityId/message', protect, sendMessage);
router.put('/activity/:activityId/read', protect, markMessagesAsRead);
router.get('/unread', protect, getUnreadMessageCount);

export default router;