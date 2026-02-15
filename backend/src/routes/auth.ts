import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  me,
  updateProfile,
  updatePassword,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login,
);

router.use(authMiddleware);

router.get('/me', me);
router.patch('/profile', updateProfile);
router.patch('/password', updatePassword);

export default router;
