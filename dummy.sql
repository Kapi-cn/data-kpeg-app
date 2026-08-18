USE db_kpeg_bpmptp;

INSERT INTO pegawai (nama) VALUES
('Andi Setiawan'),
('Budi Santoso'),
('Citra Lestari'),
('Dewi Anggraini'),
('Eko Pratama'),
('Fajar Nugroho');

INSERT INTO kegiatan (
  nama_kegiatan,
  kategori,
  waktu_mulai,
  waktu_selesai,
  status,
  lokasi,
  output
) VALUES
(
  'Koordinasi Program Kerja',
  'DLT',
  '2026-08-10 08:00:00',
  '2026-08-10 12:00:00',
  'Selesai',
  'Semarang',
  'Hasil koordinasi program kerja'
),
(
  'Pemateri Pelatihan Administrasi',
  'TN',
  '2026-08-11 09:00:00',
  '2026-08-11 15:00:00',
  'Selesai',
  'Gedung Pelatihan BPMPTP',
  'Materi dan dokumentasi pelatihan'
),
(
  'Penyusunan Laporan Kegiatan',
  'DP',
  '2026-08-12 08:00:00',
  '2026-08-12 16:00:00',
  'Berlangsung',
  'Kantor BPMPTP',
  'Draft laporan kegiatan'
),
(
  'Pendampingan Kegiatan Lapangan',
  'DLK',
  '2026-08-13 07:30:00',
  '2026-08-13 14:00:00',
  'Terjadwal',
  'Kabupaten Semarang',
  'Laporan hasil pendampingan'
);

INSERT INTO kegiatan_pegawai (kegiatan_id, pegawai_id) VALUES
(1, 1),
(1, 2),
(1, 3),

(2, 2),
(2, 4),
(2, 5),

(3, 1),
(3, 3),
(3, 6),

(4, 2),
(4, 5),
(4, 6);