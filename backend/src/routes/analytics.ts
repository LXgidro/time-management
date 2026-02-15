import { Router } from 'express';
import { getSummary } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/summary', getSummary);

export default router;
