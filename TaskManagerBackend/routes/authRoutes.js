
import { AuthController } from '../controllers/authController.js'; 
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

import express from 'express';

//protect: middleware to protect routes (jwt token verification)

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.get('/profile', protect, AuthController.getProfile);
router.put('/profile', protect, AuthController.updateProfile);
router.post('/upload-image', upload.single('image'), AuthController.uploadImage);

export default router;