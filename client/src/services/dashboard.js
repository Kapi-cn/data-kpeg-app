export const getSidebarStats = async () => {
  const response = await fetch(`/api/dashboard`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Gagal mengambil statistik sidebar');
  }

  const data = await response.json();

  return data.data;
};
