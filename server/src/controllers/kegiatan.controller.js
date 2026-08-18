import pool from '../config/database.js'

export const getKegiatan = async (c) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        k.id,
        k.nama_kegiatan,
        k.kategori,
        k.waktu_mulai,
        k.waktu_selesai,
        k.status,
        k.lokasi,
        k.output,
        k.created_at,
        p.id AS pegawai_id,
        p.nama AS pegawai_nama
      FROM kegiatan k
      LEFT JOIN kegiatan_pegawai kp
        ON kp.kegiatan_id = k.id
      LEFT JOIN pegawai p
        ON p.id = kp.pegawai_id
      ORDER BY k.created_at DESC
    `);

    const kegiatanMap = new Map();

    for (const row of rows) {
      if (!kegiatanMap.has(row.id)) {
        kegiatanMap.set(row.id, {
          id: row.id,
          nama_kegiatan: row.nama_kegiatan,
          kategori: row.kategori,
          waktu_mulai: row.waktu_mulai,
          waktu_selesai: row.waktu_selesai,
          status: row.status,
          lokasi: row.lokasi,
          output: row.output,
          created_at: row.created_at,
          pegawai: [],
        });
      }

      if (row.pegawai_id) {
        kegiatanMap.get(row.id).pegawai.push({
          id: row.pegawai_id,
          nama: row.pegawai_nama,
        });
      }
    }

    return c.json({
      data: Array.from(kegiatanMap.values()),
    });
  } catch (error) {
    console.error(error);

    return c.json({
       message: 'Gagal mengambil data kegiatan',
    }, 500);
  }
}

export const createKegiatan = async (c) => {
  try {
    const body = await c.req.json();
    const {
      nama_kegiatan,
      kategori,
      waktu_mulai,
      waktu_selesai,
      status,
      lokasi,
      output,
      pegawai_ids,
    } = body;

    if (!nama_kegiatan || !kategori || !waktu_mulai || !waktu_selesai || !status || !lokasi) {
      return c.json({ message: 'Field required missing' }, 400);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(`
        INSERT INTO kegiatan (nama_kegiatan, kategori, waktu_mulai, waktu_selesai, status, lokasi, output)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [nama_kegiatan, kategori, waktu_mulai, waktu_selesai, status, lokasi, output]);

      const kegiatanId = result.insertId;

      if (Array.isArray(pegawai_ids) && pegawai_ids.length > 0) {
        const values = pegawai_ids.map((pid) => [kegiatanId, pid]);
        await conn.query(`
          INSERT INTO kegiatan_pegawai (kegiatan_id, pegawai_id)
          VALUES ?
        `, [values]);
      }

      await conn.commit();

      return c.json({ message: 'Kegiatan dibuat', id: kegiatanId }, 201);
    } catch (err) {
      await conn.rollback();
      console.error(err);
      return c.json({ message: 'Gagal menyimpan kegiatan' }, 500);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Invalid request' }, 400);
  }
}

export const updateKegiatan = async (c) => {
  try {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const {
      nama_kegiatan,
      kategori,
      waktu_mulai,
      waktu_selesai,
      status,
      lokasi,
      output,
      pegawai_ids,
    } = body;

    if (!id || !nama_kegiatan || !kategori || !waktu_mulai || !waktu_selesai || !status || !lokasi) {
      return c.json({ message: 'Field required missing' }, 400);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(`
        UPDATE kegiatan
        SET nama_kegiatan = ?, kategori = ?, waktu_mulai = ?, waktu_selesai = ?, status = ?, lokasi = ?, output = ?
        WHERE id = ?
      `, [nama_kegiatan, kategori, waktu_mulai, waktu_selesai, status, lokasi, output, id]);

      await conn.query(`
        DELETE FROM kegiatan_pegawai
        WHERE kegiatan_id = ?
      `, [id]);

      if (Array.isArray(pegawai_ids) && pegawai_ids.length > 0) {
        const values = pegawai_ids.map((pid) => [id, pid]);
        await conn.query(`
          INSERT INTO kegiatan_pegawai (kegiatan_id, pegawai_id)
          VALUES ?
        `, [values]);
      }

      await conn.commit();

      return c.json({ message: 'Kegiatan diperbarui', id }, 200);
    } catch (err) {
      await conn.rollback();
      console.error(err);
      return c.json({ message: 'Gagal memperbarui kegiatan' }, 500);
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Invalid request' }, 400);
  }
};

export const deleteKegiatan = async (c) => {
  try {
    const id = Number(c.req.param('id'));

    if (!id) {
      return c.json({ message: 'ID kegiatan tidak valid' }, 400);
    }

    const [result] = await pool.query(`
      DELETE FROM kegiatan
      WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return c.json({ message: 'Kegiatan tidak ditemukan' }, 404);
    }

    return c.json({ message: 'Kegiatan dihapus', id }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Gagal menghapus kegiatan' }, 500);
  }
};
