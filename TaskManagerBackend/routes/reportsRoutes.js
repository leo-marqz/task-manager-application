
import express from 'express';
import { adminOnly, protect } from '../middlewares/authMiddleware.js';
import { ReportController } from '../controllers/reportController.js';

const router = express.Router();

router.get('/export/tasks', protect, adminOnly, ReportController.exportTasksReport);
router.get('/export/users', protect, adminOnly, ReportController.exportUsersReport);

export default router;