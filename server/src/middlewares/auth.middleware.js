import { getCookie } from 'hono/cookie';
import pool from '../config/database.js';

export const authMiddleware = async (c, next) => {
  const sessionId = getCookie(c, 'session_id');

  if (!sessionId) {
    return c.json({
      message: 'Unauthorized',
    }, 401);
  }

  const [rows] = await pool.query(`
    SELECT
      sessions.id,
      sessions.user_id,
      sessions.expires_at,
      users.username,
      users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ?
      AND sessions.expires_at > NOW()
  `, [sessionId]);

  // Cek jika session tidak ada
  if (rows.length === 0) {
    return c.json({
      message: 'Session tidak valid atau sudah kadaluarsa',
    }, 401);
  }

  const session = rows[0];

  // Simpan ke context Hono
  c.set('user', {
    id: session.user_id,
    username: session.username,
    role: session.role,
  });

  await next();
};