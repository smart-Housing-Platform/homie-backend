import * as express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);

export default router; 