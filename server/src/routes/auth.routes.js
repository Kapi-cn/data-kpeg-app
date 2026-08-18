import { Hono } from 'hono';

import { login, logout, me } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRoute = new Hono();

authRoute.post('/login', login);

authRoute.get('/me', authMiddleware, me);

authRoute.post('/logout', logout);

export default authRoute;
