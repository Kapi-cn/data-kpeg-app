import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';

import { logger } from './middlewares/logger.middleware.js';
import kegiatanRoute from './routes/kegiatan.routes.js';
import authRoute from './routes/auth.routes.js';
import pegawaiRoute from './routes/pegawai.route.js';
import dashboardRoute from './routes/dashboard.routes.js';

import 'dotenv/config';
import { serveStatic } from '@hono/node-server/serve-static';

import pool from './config/database.js';

const app = new Hono();

if (process.env.NODE_ENV === 'production') {
  app.use('../assets/*', serveStatic({ root: '../client/dist/assets' }));
  app.use('*', serveStatic({ root: '../client/dist' }));
}

if (process.env.NODE_ENV === 'development') {
  app.use(
    '*',
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );
}

pool.getConnection()
  .then((connection) => {
    console.log('Database connected')
    connection.release()
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message)
});

app.use('*', logger);

app.route('/api/auth', authRoute);
app.route('/api/kegiatan', kegiatanRoute);
app.route('/api/pegawai', pegawaiRoute);
app.route('/api/dashboard', dashboardRoute);

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log('Server running on http://localhost:3000');
