import pool from '../config/database.js';

export const getPegawai = async (c) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nama
      FROM pegawai
      ORDER BY nama ASC
    `);

    return c.json({
      data: rows,
    })
  } catch (error) {
    console.error(error);

    return c.json({
      message: 'Gagal mengambil data pegawai',
    },500);
  }
}

export const createPegawai = async (c) => {
  try {
    const body = await c.req.json();
    const nama = String(body?.nama || '').trim();

    if (!nama) {
      return c.json({ message: 'Nama pegawai wajib diisi' }, 400);
    }

    const [result] = await pool.query(`
      INSERT INTO pegawai (nama)
      VALUES (?)
    `, [nama]);

    return c.json({
      message: 'Pegawai ditambahkan',
      id: result.insertId,
    }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Gagal menambah pegawai' }, 500);
  }
}