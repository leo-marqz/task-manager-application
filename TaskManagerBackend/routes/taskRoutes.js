
import express from 'express';

import { TaskController } from '../controllers/taskController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-data', protect, TaskController.getDashboardData);
router.get('/user-dashboard-data', protect, TaskController.getUserDashboardData);

router.get('/', protect, TaskController.getAllTasks); // Get all tasks (Admin: all, User: assigned)
router.get('/:id', protect, TaskController.getTaskById); 
router.post('/', protect, adminOnly, TaskController.createTask); 
router.put('/:id', protect, TaskController.updateTask); 
router.delete('/:id', protect, adminOnly, TaskController.deleteTask);

router.put('/:id/status', protect, TaskController.updateTaskStatus); 
router.put('/:id/todo', protect, TaskController.updateTaskChecklist);

export default router;