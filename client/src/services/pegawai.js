const API_URL = import.meta.env.VITE_API_URL;

export const getPegawai = async () => {
  const response = await fetch(`/api/pegawai`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil data pegawai');
  }

  const data = await response.json();

  return data.data;
};

export const createPegawai = async (payload) => {
  const response = await fetch(`/api/pegawai`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menambah pegawai');
  }

  return response.json();
};

export const updatePegawai = async (id, payload) => {
  const response = await fetch(`$/api/pegawai/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memperbarui pegawai');
  }

  return response.json();
};

export const deletePegawai = async (id) => {
  const response = await fetch(`/api/pegawai/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menghapus pegawai');
  }

  return response.json();
};
