const API_URL = import.meta.env.VITE_API_URL;

export const getSidebarStats = async () => {
  const response = await fetch(`${API_URL}/dashboard`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil statistik sidebar');
  }

  const data = await response.json();

  return data.data;
};
