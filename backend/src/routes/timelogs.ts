import { Router } from 'express';
import { getTimeLogs, deleteTimeLog } from '../controllers/timeLogController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTimeLogs);
router.delete('/:id', deleteTimeLog);

export default router;
