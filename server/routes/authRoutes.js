import express from 'express';
import { register, login, getProfile, updateProfile, updateProfileImage } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/image', protect, uploadProfileImage, updateProfileImage);

export default router;