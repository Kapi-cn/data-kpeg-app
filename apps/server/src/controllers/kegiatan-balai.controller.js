import pool from "../config/database.js";

export const getKegiatanBalai = async (c) => {
	try {
		const [rows] = await pool.query(`
      SELECT id, nama_kegiatan, tanggal, jam, lokasi
      FROM kegiatan_balai
      ORDER BY tanggal ASC, jam ASC
    `);

		return c.json({ data: rows });
	} catch (error) {
		console.error(error);
		return c.json({ message: "Gagal mengambil kegiatan balai" }, 500);
	}
};

export const createKegiatanBalai = async (c) => {
	try {
		const body = await c.req.json();
		const namaKegiatan = String(body?.nama_kegiatan || "").trim();
		const tanggal = String(body?.tanggal || "").trim();
		const jam = String(body?.jam || "").trim();
		const lokasi = String(body?.lokasi || "").trim();

		if (!namaKegiatan || !tanggal || !jam || !lokasi) {
			return c.json(
				{ message: "Nama kegiatan, tanggal, jam, dan lokasi wajib diisi" },
				400,
			);
		}

		const tanggalValue = `${tanggal} 00:00:00`;
		const jamValue = `${tanggal} ${jam}:00`;

		const [result] = await pool.query(
			`
      INSERT INTO kegiatan_balai (nama_kegiatan, tanggal, jam, lokasi)
      VALUES (?, ?, ?, ?)
    `,
			[namaKegiatan, tanggalValue, jamValue, lokasi],
		);

		return c.json(
			{ message: "Kegiatan balai dibuat", id: result.insertId },
			201,
		);
	} catch (error) {
		console.error(error);
		return c.json({ message: "Gagal menyimpan kegiatan balai" }, 500);
	}
};

export const updateKegiatanBalai = async (c) => {
	try {
		const id = Number(c.req.param("id"));
		const body = await c.req.json();
		const namaKegiatan = String(body?.nama_kegiatan || "").trim();
		const tanggal = String(body?.tanggal || "").trim();
		const jam = String(body?.jam || "").trim();
		const lokasi = String(body?.lokasi || "").trim();

		if (!id || !namaKegiatan || !tanggal || !jam || !lokasi) {
			return c.json({ message: "Data kegiatan balai tidak lengkap" }, 400);
		}

		const tanggalValue = `${tanggal} 00:00:00`;
		const jamValue = `${tanggal} ${jam}:00`;

		const [result] = await pool.query(
			`
      UPDATE kegiatan_balai
      SET nama_kegiatan = ?, tanggal = ?, jam = ?, lokasi = ?
      WHERE id = ?
    `,
			[namaKegiatan, tanggalValue, jamValue, lokasi, id],
		);

		if (!result.affectedRows)
			return c.json({ message: "Kegiatan balai tidak ditemukan" }, 404);
		return c.json({ message: "Kegiatan balai diperbarui", id });
	} catch (error) {
		console.error(error);
		return c.json({ message: "Gagal memperbarui kegiatan balai" }, 500);
	}
};

export const deleteKegiatanBalai = async (c) => {
	try {
		const id = Number(c.req.param("id"));
		if (!id) return c.json({ message: "ID kegiatan balai tidak valid" }, 400);

		const [result] = await pool.query(
			"DELETE FROM kegiatan_balai WHERE id = ?",
			[id],
		);
		if (!result.affectedRows)
			return c.json({ message: "Kegiatan balai tidak ditemukan" }, 404);
		return c.json({ message: "Kegiatan balai dihapus", id });
	} catch (error) {
		console.error(error);
		return c.json({ message: "Gagal menghapus kegiatan balai" }, 500);
	}
};
