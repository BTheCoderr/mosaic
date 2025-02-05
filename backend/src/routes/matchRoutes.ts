import { Router } from 'express';
import { getPotentialMatches, likeProfile, passProfile, getMatches, unmatch } from '../controllers/matchController';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get potential matches
router.get('/potential', rateLimiter, getPotentialMatches);

// Like/Pass profiles
router.post('/like/:targetUserId', rateLimiter, likeProfile);
router.post('/pass/:targetUserId', rateLimiter, passProfile);

// Get existing matches
router.get('/matches', getMatches);

// Unmatch
router.post('/unmatch/:matchId', unmatch);

export default router; 