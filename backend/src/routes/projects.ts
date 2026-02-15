import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post(
  '/',
  [body('name').notEmpty().withMessage('Название обязательно')],
  createProject,
);

router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
