import pool from '../config/database.js'

export const getSidebarStats = async (c) => {
  try {
    const [[{ bulan_count }]] = await pool.query(`
      SELECT COUNT(*) AS bulan_count
      FROM kegiatan
      WHERE MONTH(waktu_mulai) = MONTH(CURRENT_DATE())
        AND YEAR(waktu_mulai) = YEAR(CURRENT_DATE())
    `);

    const [[{ pegawai_aktif_count }]] = await pool.query(`
      SELECT COUNT(DISTINCT kp.pegawai_id) AS pegawai_aktif_count
      FROM kegiatan_pegawai kp
      JOIN kegiatan k ON k.id = kp.kegiatan_id
      WHERE MONTH(k.waktu_mulai) = MONTH(CURRENT_DATE())
        AND YEAR(k.waktu_mulai) = YEAR(CURRENT_DATE())
    `);

    return c.json({
      data: {
        bulanIni: Number(bulan_count) || 0,
        pegawaiAktif: Number(pegawai_aktif_count) || 0,
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: 'Gagal mengambil statistik' }, 500);
  }
};
