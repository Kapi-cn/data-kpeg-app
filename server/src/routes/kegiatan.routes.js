import { Hono } from 'hono';

import { getKegiatan, createKegiatan, updateKegiatan, deleteKegiatan } from '../controllers/kegiatan.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js'

const kegiatanRoute = new Hono();

kegiatanRoute.use('*', authMiddleware);

kegiatanRoute.post('/', createKegiatan);
kegiatanRoute.get('/', getKegiatan);
kegiatanRoute.put('/:id', updateKegiatan);
kegiatanRoute.delete('/:id', deleteKegiatan);

export default kegiatanRoute;
