import { Hono } from 'hono';

import { getPegawai } from '../controllers/pegawai.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const pegawaiRoute = new Hono();

pegawaiRoute.use('*', authMiddleware);

pegawaiRoute.get('/', getPegawai);

export default pegawaiRoute;
