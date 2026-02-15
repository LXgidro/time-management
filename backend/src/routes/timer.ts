import express from 'express';
import {
  getActiveTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
} from '../controllers/timer';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/active', getActiveTimer);
router.post('/start', startTimer);
router.patch('/:id/pause', pauseTimer);
router.patch('/:id/resume', resumeTimer);
router.patch('/:id/stop', stopTimer);

export default router;
