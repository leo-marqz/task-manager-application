
import express from 'express';
import { UserController } from '../controllers/userController.js';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, UserController.getAllUsers);
router.get('/:id', protect, UserController.getUserById);

export default router;