
import express from 'express';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import { ReportController } from '../controllers/reportController.js';

const router = express.Router();

// Export all tasks as Excel or PDF
// GET /api/v1/reports/export/tasks
router.get('/export/tasks', protect, adminOnly, ReportController.exportTasksReport);
// Export all users as Excel or PDF
// GET /api/v1/reports/export/users
router.get('/export/users', protect, adminOnly, ReportController.exportUsersReport);

export default router;