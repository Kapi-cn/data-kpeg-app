const API_URL = import.meta.env.VITE_API_URL;

export const getKegiatanAll = async () => {
  const response = await fetch(`${API_URL}/kegiatan`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data kegiatan');
  }

  const data = await response.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;

  return [];
}

export const createKegiatan = async (payload) => {
  const response = await fetch(`${API_URL}/kegiatan`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal membuat kegiatan');
  }

  const data = await response.json();
  return data;
}

export const updateKegiatan = async (id, payload) => {
  const response = await fetch(`${API_URL}/kegiatan/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memperbarui kegiatan');
  }

  return response.json();
}

export const deleteKegiatan = async (id) => {
  const response = await fetch(`${API_URL}/kegiatan/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menghapus kegiatan');
  }

  return response.json();
}
