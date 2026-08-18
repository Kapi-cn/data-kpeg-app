import bcrypt from 'bcrypt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';

import pool from '../config/database.js';

export const login = async (c) => {
  const { username, password } = await c.req.json();

  const [rows] = await pool.query(
    'SELECT id, username, password, role FROM users WHERE username = ?',
  [username]);

  // Cek jika username ada
  if (rows.length === 0) {
    return c.json({
      message: 'Username atau password tidak cocok dengan akun yang terdaftar.'
    }, 401);
  }

  const user = rows[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  // Cek jika password salah
  if (!passwordMatch) {
    return c.json({
      message: 'Username atau password tidak cocok dengan akun yang terdaftar.'
    }, 401);
  }

  // Buat session ID
  const sessionId = crypto.randomUUID().replaceAll('-', '');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
  [sessionId, user.id, expiresAt]);

  // Simpan session di cookie
  setCookie(c, 'session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });
  
  return c.json({
    message: 'Data login diterima',
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
};

export const logout = async (c) => {
  const sessionId = getCookie(c, 'session_id');

  if (sessionId) {
    await pool.query(
      'DELETE FROM sessions WHERE id = ?',
    [sessionId]);
  }

  deleteCookie(c, 'session_id', {
    path: '/',
  });

  return c.json({
    message: 'Logout berhasil',
  });
}

export const me = async (c) => {
  const user = c.get('user');

  return c.json({
    user,
  });
}
