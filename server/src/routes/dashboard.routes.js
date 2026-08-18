import { Hono } from 'hono';

import { getSidebarStats } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const dashboardRoute = new Hono();

dashboardRoute.use('*', authMiddleware);

dashboardRoute.get('/', getSidebarStats);

export default dashboardRoute;
