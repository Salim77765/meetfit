import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { ChatbotController } from '../controllers/chatbot.js';

const router = express.Router();

// Process chatbot messages
router.post('/message', protect, ChatbotController.processMessage);

// Get recommendations based on user preferences
router.get('/recommendations', protect, ChatbotController.getRecommendations);

export default router; 