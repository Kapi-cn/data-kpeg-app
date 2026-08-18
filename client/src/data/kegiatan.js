export const STATUS_KEGIATAN = [
  {
    key: 'terjadwal',
    label: 'Terjadwal',
    active: 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/2',
  },
  {
    key: 'berlangsung',
    label: 'Berlangsung',
    active: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25',
  },
  {
    key: 'selesai',
    label: 'Selesai',
    active: 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25',
  },
  {
    key: 'dibatalkan',
    label: 'Dibatalkan',
    active: 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/25',
  },
];

export const KATEGORI_LABEL = [
  {
    key: 'DLT',
    label: 'DLT',
    long: 'Dinas Luar Tim',
  },
  {
    key: 'TN',
    label: 'TN',
    long: 'Tugas Narsum',
  },
  {
    key: 'DP',
    label: 'DP',
    long: 'Dalam Penugasan',
  },
  {
    key: 'DLK',
    label: 'DLK',
    long: 'Dinas Luar Kegiatan',
  },
];

export const mapStatusToForm = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  return STATUS_KEGIATAN.some((status) => status.key === normalized) ? normalized : 'terjadwal';
};

export const getStatusLabel = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();

  const statusMap = {
    terjadwal: 'Terjadwal',
    berlangsung: 'Berlangsung',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };

  return statusMap[normalized] || 'Terjadwal';
};
