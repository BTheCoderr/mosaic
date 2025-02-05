import { Router } from 'express';
import { register, login, verifyEmail, requestPasswordReset, resetPassword } from '../controllers/authController';
import { validateRegistration, validateLogin, validatePasswordReset } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Registration route
router.post('/register', validateRegistration, rateLimiter, register);

// Login route
router.post('/login', validateLogin, rateLimiter, login);

// Email verification
router.get('/verify/:token', verifyEmail);

// Password reset
router.post('/password/reset-request', rateLimiter, requestPasswordReset);
router.post('/password/reset', validatePasswordReset, rateLimiter, resetPassword);

export default router; 